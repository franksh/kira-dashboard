"""
This is the KIRA movement simulation.

The simulation models the movement of individuals from an initial
outbreak location.

The simulation is controlled by the backend API.
The dashboard sends a request to the backend API, which
then runs the simulation and returns the simulation result.
"""
import configparser
import os
import pickle
import json
import pandas as pd
import geopandas as gpd
import numpy as np
from numpy.random import exponential


class MovementSimulation():
    """
    The movement simulation.
    """

    def __init__(self):

        # Load config
        config = configparser.ConfigParser()
        file_path = os.path.dirname(os.path.realpath(__file__))
        config.read(file_path + "/config.ini")
        self.config = config
        # Set file paths
        data_dir = os.path.dirname(file_path) + '/data/'
        self.data_dir_input = data_dir + 'input/'
        self.data_dir_output = data_dir + 'output/'

        # Data holders
        self.OD_DATA = None
        self.LOC_DENSITY_DATA = None
        self.CELL_LOC_MAP = None
        self.LOC_CELL_MAP = None
        self.CELL_BOUNDS = None

        self.PPLACE_CLOUD_DATA = None

        self.VERBOSE = self.config['GENERAL']['VERBOSE']

        self.TAU = config.getfloat('PARAMS', 'TAU')
        self.N_IND = config.getint('PARAMS', 'N_IND')
        self.T_SIMULATE = config.getint('PARAMS', 'T_SIMULATE')

        # Dynamic variables
        self.trajectories = None
        self.outbreak_location = None
        self.outbreak_time = None

        self.initialize()

    # INITIALIZATION #####################

    def initialize(self):
        """
        Initialize according to config
        """
        if self.VERBOSE:
            print("Initializing Simulation ...")

        self._load_data()
        self.reset_simulation()

    # DATA LOADING #######################

    def _load_data(self):
        """
        Load all data required for the simulation
        """
        self._load_motionlogic_flow_OD()
        self._load_motionlogic_cells_bounds()
        self._load_loc_cellid_data()
        self._load_pplace_cloud_data()
        self._create_cellid_loc_mapping()

    def _load_motionlogic_flow_OD(self):
        """
        Load the dictionary containing the motionlogic flows,
        see method in input_data_processing

        The dictionary has the following form:
        flows[origin_cell_id][time] = [ [dest_ids], [probs] ]
        """
        if self.VERBOSE:
            print(" -- Loading motionlogic OD data ...")

        file_path = self.data_dir_input + \
            self.config['DATA']['MOTIONLOGIC_OD_DICT_FILE']
        f = open(file_path, 'rb')
        flows = pickle.load(f)
        self.OD_DATA = flows

    def _load_motionlogic_cells_bounds(self):
        """
        Loads a table containing the bounding boxes of the
        motionlogic movement cells. Used i.e. to generate
        coordinates of a new location in cell.
        """
        if self.VERBOSE:
            print(" -- Loading motionlogic cell boundaries ...")

        file_path = self.data_dir_input + \
            self.config['DATA']['CELL_BOUNDS_FILE']
        bounds = pd.read_csv(file_path)
        bounds = bounds.set_index('id')
        self.CELL_BOUNDS = bounds

    def _load_loc_cellid_data(self):
        """
        Load the table containing the list of locations
        (as gathered from the Germany tweets) and the corresponding cell_id's

        Returns:
        -- LOC_DENSITY_DATA: Format
                loc_id | lat | lon | count | cell_id
        """
        if self.VERBOSE:
            print(" -- Loading location-cell_id data ...")
        file_path = self.data_dir_input + \
            self.config['DATA']['LOC_CELL_MAPPING_FILE']
        locs = pd.read_csv(file_path)

        # Filter by bbox Berlin
        # if self.FILTER_BERLIN_BBOX:
        #     locs = self._filter_by_bbox(locs, bbox=constants['BBOX_BERLIN'])
        # Process data
        locs = locs.dropna()
        locs['cell_id'] = locs['cell_id'].astype(int)
        # Assign weight
        locs['weight'] = np.log10(locs['count'])+1
        # Reindex
        locs = locs.reset_index(drop=True)

        # Assign location id's
        locs = locs.reset_index().rename(columns={'index': 'loc_id'})
        self.LOC_DENSITY_DATA = locs

    def _load_pplace_cloud_data(self):
        """
        Loads the data from Karstens cloud simulation to
        initialize the simulation with.

        This extracts two main variables from the data:
        - prob: The probability that an individual gets infected in cell i,
            which is Einwohnezahl * qty_part (exposure)
        - outbreak_delay: The time delay until someone can get infected there.
            Assumption is that the cloud takes 1 hour to reach each qty_part-zone
        """
        if self.VERBOSE:
            print(" -- Loading pplace cloud data ...")
        file_path = self.data_dir_input + \
            self.config['DATA']['PPLACE_CLOUD_FILE']

        gdf = gpd.read_file(file_path)
        # Calculate weight / probability to pick each place:
        # Count einwohner * qty_part
        weight = gdf['EW2017'] * gdf['qty_part']
        gdf['prob'] = weight / weight.sum()

        # Calculate outbreak delay time
        outbreak_delays = {
            200000: 0,
            100000: 1,
            30000: 2,
            10000: 3,
            3000: 4,
            1000: 5,
            300: 6,
        }
        gdf['outbreak_delay'] = gdf['qty_part'].map(outbreak_delays)

        # Calc lat/lon data
        gdf['lon'] = gdf.centroid.x
        gdf['lat'] = gdf.centroid.y

        # Save info
        self.PPLACE_CLOUD_DATA = gdf[['prob', 'outbreak_delay', 'lat', 'lon']]

    def _create_cellid_loc_mapping(self):
        """
        Creates a mapping cell_id -> locs_in_cell
        to quickly find a random location within a cell

        The map contains, for each cell_id, the loc_ids
        within the cell, paired with their count

        Returns:
        -- CELL_LOC_MAP: A df with indices cell_id, loc_id
            and the count of each loc_id
            Use it like:
                m = m.loc[cell_id]
                np.random.choice(m.index, p = m.values/m.values.sum())
        -- LOC_CELL_MAP: Same but swapped
        """

        locs = self.LOC_DENSITY_DATA

        mapping = locs.groupby(by=['cell_id', 'loc_id']).sum()
        # Assign weight
        mapping['weight'] = np.log10(mapping['count'])+1
        mapping = mapping['weight']

        self.CELL_LOC_MAP = mapping
        self.LOC_CELL_MAP = mapping.copy().swaplevel().sort_index()

    ## SIMULATION ####################################

    def reset_simulation(self):
        """
        Prepares everything for a new simulation
        """
        trajectories = []
        self.trajectories = trajectories

    def run_simulation(self, outbreak_location, outbreak_time):
        """
        Runs the diffusion simulation

        The trajectories start from a given outbreak location,
        at the given time.
        """

        # Test whether parameters valid
        # try:
        #     _ = self._get_cell_id_of_lat_lon(*outbreak_location)
        # except IndexError as e:
        #     raise IndexError("The outbreak location lies outside Germany")

        if self.VERBOSE:
            print("Starting Simulation ...")
            print("Simulation N={} individuals ...".format(self.N_IND))
            import time
            time_start = time.time()

        self.outbreak_time = outbreak_time
        t_max = self.T_SIMULATE + outbreak_time

        # Simulate individuals
        for ind in self.tqdm_counter(range(self.N_IND)):

            # Get start location and time delay
            start_loc, delay = self._get_infection_loc_delay(outbreak_location)

            # Set time
            self.t = outbreak_time + delay

            cell_first = self._get_cell_of_loc(start_loc)
            self._add_location_to_individual(
                self.t, ind, start_loc, cell_first)

            self.t += self._get_jump_time(self.t)
            while self.t < t_max:
                loc_id, cell_id = self._get_jump_location(self.t, ind)
                self._add_location_to_individual(self.t, ind, loc_id, cell_id)
                self.t += self._get_jump_time(self.t)

        if self.VERBOSE:
            print("Simulation completed")
            minutes, seconds = divmod(time.time() - time_start, 60)
            print("Time: {:.0f}min {:.2f}s".format(minutes, seconds))

    def _get_jump_location(self, t, ind):
        """
        Returns a new location and cell for the individual.

        Location is chosen according to the flows from the current cell
        """

        # Get current location of individual
        loc_id_current, cell_id_current = self.trajectories[-1][2:4]

        # Do outgoing flows for this cell exist?
        flowsExist = cell_id_current in self.OD_DATA.keys()

        # Find target cell using flows from od data
        if flowsExist:

            OD_DATA_CELL = self.OD_DATA[cell_id_current]
            weektime = self._get_weektime()
            defaulttime = -1
            # Check if there is a flow at that time
            flowExistsAtWeektime = weektime in OD_DATA_CELL.keys()
            if flowExistsAtWeektime:
                # Use flow at that weektime
                cell_ids, T_ijs = OD_DATA_CELL[weektime]
                cell_id = self._pick_cell_from_flows(cell_ids, T_ijs)
                loc_id = self._pick_location_from_cell(cell_id)

            else:
                # Use default flow
                cell_ids, T_ijs = OD_DATA_CELL[defaulttime]
                # Check if this cell is a dead end
                # This is the case if even the default-flows (aggregated over
                # all times) contain no flows or only self-flows
                anyFlowsFromThisCellExist = len(cell_ids) >= 1
                if anyFlowsFromThisCellExist:
                    cell_id = self._pick_cell_from_flows(cell_ids, T_ijs)
                    loc_id = self._pick_location_from_cell(cell_id)
                # If there are no flows from this cell at all,
                # choose random location in Berlin from density table.
                # This should be a very edge case
                else:
                    loc_id, cell_id = self._get_random_location_from_density()
        # If no flows exist, choose random cell
        else:
            loc_id, cell_id = self._get_random_location_from_density()
        return loc_id, cell_id

    def _pick_cell_from_flows(self, cell_ids, T_ijs):
        """
        Given an array of cells and their flow weights,
        choose a cell according to the flows
        """
        cell_id = np.random.choice(cell_ids, p=T_ijs)
        return cell_id

    def _pick_location_from_cell(self, cell_id):
        """
        Determines a location within the cell.
        It is picked from the Tweet Locations if there exists
        any within the cell, otherwise add a random location
        in cell
        """
        # Does cell exists in map?
        # equivalent to: (probably)
        # Does tweets exist in cell?
        cellExistsInMap = cell_id in self.CELL_LOC_MAP.index.levels[0]

        if cellExistsInMap:
            # Pick location from tweets in cell
            loc = self._pick_location_from_tweets_in_cell(cell_id)
        else:
            # Create a new location in cell
            # create_new_location
            loc = self._create_new_location_in_cell(cell_id)
            # CONTINUE HERE
        return loc

    def _pick_location_from_tweets_in_cell(self, cell_id):
        """
        Pick a location from tweets in the cell.
        Assumes that there exist tweets in the cell (check before).
        """
        loc_map = self.CELL_LOC_MAP[cell_id]
        loc_ids, loc_probs = loc_map.index, loc_map.values
        loc = np.random.choice(loc_ids, p=loc_probs/np.sum(loc_probs))
        return loc

    def _get_random_location_from_density(self):
        """
        Returns the id of a random location,
        chosen from the location density table (LOC_DENSITY_DATA).
        Weighted?

        Returns:
        -- loc_id
        -- cell_id
        """
        locs = self.LOC_DENSITY_DATA
        weights = locs['weight']
        # Choose random
        idx = np.random.choice(
            weights.index, p=weights.values/weights.values.sum())
        # Get loc_id, cell_id
        loc_id, cell_id = locs.loc[idx][['loc_id', 'cell_id']]
        return (loc_id, cell_id)

    def _get_infection_loc_delay(self, outbreak_location):
        """
        Returns outbreak location and the time delay when person got infected

        Returns the outbreak location as the start location. Adds it to
        the location map. Returns also the time delay until person gets infected
        (infection_time = outbreak_time + delay).

        Returns:
        - location: The start/infection location
        - delay: Hours until person gets infected/starts running. In [0,6]
        """
        # If outbreak location is lat/lon coordinates:

        if type(outbreak_location) == list:
            # Steps:
            # Get bounding box around outbreak location
            bbox = self._get_location_bounding_box(*outbreak_location)
            # Get the center
            center = np.mean(np.array(bbox).reshape(2, 2), axis=0)
            # Create new location
            location = self._create_new_location_at_lat_lon(*center[::-1])
            delay = 0
        # If outbreak_location is a place
        elif outbreak_location == 'PPLACE_CLOUD_DATA':
            gdf = self.PPLACE_CLOUD_DATA

            idx_loc = np.random.choice(len(gdf), p=gdf['prob'])
            loc_data = gdf.loc[idx_loc]
            location = self._create_new_location_at_lat_lon(loc_data['lat'],
                                                            loc_data['lon'])
            delay_min = loc_data['outbreak_delay']
            delay = np.random.randint(delay_min, 7)
        else:
            raise ValueError("Outbreak location unknown: ", outbreak_location)
        return location, delay

    def _get_start_locations_at_outbreak_location(self, outbreak_location):
        """
        Returns a list of locations where individuals can
        start their trajectories.

        Returns:
        - locations: A list of location-id's from the cell in which the
            outbreak location lies
        """
        # Steps:
        # Get bounding box around outbreak location
        bbox = self._get_location_bounding_box(*outbreak_location)
        # Get all tweet locations in bounding box
        locations = self._get_tweet_locations_in_bbox(bbox)
        # Add random locations in bbox if to few or none tweet locations exist
        locations = self._add_locations_if_not_enough(
            locations, outbreak_location)
        return locations

    def _add_location_to_individual(self, t, ind, loc_id, cell_id):
        """
        Appends the location to the path of the individual
        Appends it to 'trajectory'
        """
        self.trajectories.append((t, ind, loc_id, cell_id))

    # WAITING TIME DISTRIBUTIONS #################

    def _get_jump_time(self, t):
        """
        Returns time until next jump
        """
        # Returns a random variable from temporal power law pdf
        # return self.time_pdf.get_rvs(t)
        if self.config['PARAMS']['WAIT_TIME_DIST'] == 'exponential':
            return self._get_jump_time_exponential()
            # return 2.85
        elif self.config['PARAMS']['WAIT_TIME_DIST'] == 'realistic':
            return self._get_jump_time_realistic()

    def _get_jump_time_exponential(self):
        """
        This is the exponentially distributed waiting time. Parameter tau
        is expected value, derived from DTU data as 2.85
        """
        return exponential(scale=self.TAU)

    def _get_jump_time_realistic(self):
        """
        This is the realistic waiting time, i.e a exponentially distributed
        waiting time, addionally modified with a sine.
        To sample the RV, a stochastic (geometric) sampling method is used.
        The expected average return time is about the same as with exponential
        distribution.
        """
        def exp_sine_pdf(dt, t, tau, offset):
            return tau * np.exp(-dt/tau) * (np.sin((dt+t-offset)/24*np.pi) ** 2)

        t_range = [0.0, 100]
        tau = self.TAU
        offset = 1.43  # Offset of the sine. I.e. least movement at 1:43 a.m.

        t = self.t
        t_low, t_high = t_range
        y_max = exp_sine_pdf(t_low, t, tau, offset)

        notFoundCounter = 0
        while notFoundCounter < 10000:
            dt_candidate = np.random.uniform(t_low, t_high)
            y = np.random.uniform(0, y_max)
            if y < exp_sine_pdf(dt_candidate, t, tau, offset):
                return dt_candidate
            notFoundCounter += 1
        raise ValueError('Not able to find time in under 10.000 iterations')

    # HELPER METHODS

    def _get_location_bounding_box(self, lat, lon):
        """
        Returns a bounding box around the location
        of size 200x200 meters
        """
        # Bounding box calculation:
        # Lat
        # 10001.965729km = 90 degrees
        # 1km = 90/10001.965729 degrees = 0.0089982311916 degrees
        # 50m = 0.008998231191 * 0.05 = 0.00044991155954999997
        # Lon
        # 40075km = 360 degrees
        # 1km = 0.0089832156
        # 50m = 0.00044915782907049286
        dist_lat = 0.00044991155954999997
        dist_lon = 0.00044915782907049286
        bbox = [lon-2*dist_lon, lat-2*dist_lat,
                lon+2*dist_lon, lat+2*dist_lat]
        return bbox

    def _get_tweet_locations_in_bbox(self, bbox):
        """
        Returns a list of tweet locations within the bounding box
        """

        lon_min, lat_min, lon_max, lat_max = bbox

        dftweet = self.LOC_DENSITY_DATA

        filt_lon = ((dftweet['lon'] > lon_min) & (dftweet['lon'] < lon_max))
        filt_lat = ((dftweet['lat'] > lat_min) & (dftweet['lat'] < lat_max))
        filt = (filt_lat & filt_lon)
        locations = dftweet[filt]['loc_id'].unique()
        return locations

    def _add_locations_if_not_enough(self, locations, outbreak_location):
        """
        Adds a few random locations if not enough tweet locations
        are found close to outbreak location
        """
        # If not enough locations, add some random
        if len(locations) < 5:
            outbreak_cell_id = self._get_cell_id_of_lat_lon(*outbreak_location)
            for i in range(5):
                loc_new = self._create_new_location_in_cell(outbreak_cell_id)
                locations = np.append(locations, [loc_new])
        return locations

    def _create_new_location_in_cell(self, cell_id):
        """
        Creates a new location within bounds of the cell
        and adds it to the location density data
        """

        # Get lat and lon
        bounds = self.CELL_BOUNDS.loc[cell_id]
        lon_min, lat_min, lon_max, lat_max = bounds
        lon = np.random.uniform(low=lon_min, high=lon_max)
        lat = np.random.uniform(low=lat_min, high=lat_max)

        # Add location to saved data
        # Gather data
        loc_id = self.LOC_DENSITY_DATA['loc_id'].max()+1
        loc_data = {
            'loc_id': loc_id,
            'lat': lat,
            'lon': lon,
            'count': 1,
            'cell_id': cell_id,
            'weight': 1,
        }
        # Add to density table
        self.LOC_DENSITY_DATA = self.LOC_DENSITY_DATA.append(
            loc_data, ignore_index=True)
        # Add to LOC_CELL_MAP
        new_map = pd.Series([loc_data['count']], index=[(loc_id, cell_id)])
        self.LOC_CELL_MAP = self.LOC_CELL_MAP.append(new_map)
        # Add to CELL_LOC_MAP
        new_map = pd.Series([loc_data['count']], index=[(cell_id, loc_id)])
        self.CELL_LOC_MAP = self.CELL_LOC_MAP.append(new_map).sort_index()

        return loc_id

    def _create_new_location_at_lat_lon(self, lat, lon):
        """
        Creates a new location at the given lat/lon coordinates
        """
        loc_id = self.LOC_DENSITY_DATA['loc_id'].max()+1
        cell_id = self._get_cell_id_of_lat_lon(lat, lon)
        loc_data = {
            'loc_id': loc_id,
            'lat': lat,
            'lon': lon,
            'count': 1,
            'cell_id': cell_id,
            'weight': 1,
        }
        # Add to density table
        self.LOC_DENSITY_DATA = self.LOC_DENSITY_DATA.append(
            loc_data, ignore_index=True)
        # Add to LOC_CELL_MAP
        new_map = pd.Series([loc_data['count']], index=[(loc_id, cell_id)])
        self.LOC_CELL_MAP = self.LOC_CELL_MAP.append(new_map)
        # Add to CELL_LOC_MAP
        new_map = pd.Series([loc_data['count']], index=[(cell_id, loc_id)])
        self.CELL_LOC_MAP = self.CELL_LOC_MAP.append(new_map).sort_index()

        return loc_id

    def _get_cell_id_of_lat_lon(self, lat, lon):
        """
        Returns the id of the cell in which the given coordinates lie
        """
        bounds = self.CELL_BOUNDS
        filt_lat = (lat >= bounds['miny']) & (lat <= bounds['maxy'])
        filt_lon = (lon >= bounds['minx']) & (lon <= bounds['maxx'])
        filt = filt_lat & filt_lon

        cell = bounds[filt]

        try:
            cell_id = cell.iloc[0].name
            return cell_id
        except IndexError as e:
            raise IndexError("The given coordinates do not lie in any cell of\
                     the Motionlogic dataset")

    def _get_cell_of_loc(self, loc_id):
        """
        Returns the cell of the location
        """
        mapping = self.LOC_CELL_MAP
        cell_id = mapping.loc[loc_id].index[0]
        return cell_id

    def _get_weektime(self):
        """
        Returns the current "weektime", which is the hour
        within the current week, ranging from 0 to (7*24)-1
        """
        weektime = int(self.t) % 168
        return weektime

    # SAVING ################

    def save_trajectories(self, LOCNAME=""):
        """
        Saves the trajectories as a snapshot usable by Angular
        """
        df = self._get_trajectories_df()
        snapshots_json = self._convert_data_for_dashboard(df)

        # Save File
        if LOCNAME == "CUSTOM":
            # Save File
            filename = "snapshots_{}_N{}.json".format(
                LOCNAME, self.N_IND
            )
            # Sve outbreak time seperately
            outbreak_time_filename = "custom_outbreak_time.json"
            with open(self.data_dir_output + outbreak_time_filename, "w") as write_file:
                json.dump({"outbreak_time": self.outbreak_time}, write_file, indent=2)

        else:
            filename = "snapshots_{}_N{}_T{}.json".format(
                LOCNAME, self.N_IND, self.outbreak_time
            )

        with open(self.data_dir_output + filename, "w") as write_file:
            json.dump(snapshots_json, write_file, indent=2)

        # df.to_csv(self.data_dir_output + filename,
        #           index=False, float_format='%.4f')

    def _get_trajectories_df(self):
        """
        Load trajectories as a dataframe of format:
        Format: user_id | time | lat_int | lon_int
        """
        df = pd.DataFrame(self.trajectories, columns=[
                          't', 'ind', 'loc_id', 'cell_id'])

        # # Add lat/lon information
        df = pd.merge(df, self.LOC_DENSITY_DATA,
                      on='loc_id', how='left', sort=True)
        df = df.sort_values(by=['ind', 't'])

        # shift outbreak time
        df['t'] -= self.outbreak_time

        # Keep only relevant info
        df = df[['ind', 't', 'lon', 'lat']]
        return df

    def _convert_data_for_dashboard(self, df):
        """
        Processes the data into the format used in angular.

        Input format:
        time | individual | lat | lon

        Output Format:
        snapshots:
            [
                {
                    timestamp: 0,
                    points:
                        [[13.32369933412694, 52.433015081899164],
                        [13.34228633508891, 52.42901685556061],
                        ...
                },
                ...
            ]
        """
        # df = df.head(1000)
        # Round time to nearest hour
        df = df.sort_values(by='t', ascending=True)
        df['t'] = df['t'].astype(int)
        # Group by time
        df = df.groupby(by=['t', 'ind']).first()
        df = df.reset_index()

        # pivot: time vs individuals, entries are lat/lon
        df = df.pivot(index='t', columns='ind', values=['lat', 'lon'])

        # Fill up missing times (if no movements at that time in data)
        t_max = df.index.max()
        df = df.reindex(index=np.arange(0, t_max+1), method='ffill')
        df.columns.names = ['loc', 'ind']
        # df = df[['lon', 'lat']]
        df = df.sort_values(by=['ind', 'loc'], axis=1)
        # Fill empty values
        df = df.fillna(method='ffill')  # .fillna(method='bfill')

        # Convert dataframe to key-value pair (timestamp-points) as
        # as is required from Angular
        n_times = df.shape[0]
        n_ind = int(df.shape[1]/2)
        vals = np.flip(df.values, axis=1)  # Switch lat and lon
        points_all = vals.reshape(n_times, n_ind, 2).tolist()

        snapshots = []
        for timestamp, points in zip(df.index, points_all):
            points_not_nan = [point for point in points if not np.isnan(point[0])]
            snapshots.append({
                'timestamp': timestamp,
                'points': points_not_nan
            })

        snapshots_json = {'snapshots': snapshots}
        return snapshots_json

    ## UTILITY #############

    def tqdm_counter(self, iterator):
        """
        A tqdm counter that only applies itself if VERBOSE
        """
        if self.VERBOSE:
            from tqdm import tqdm
            return tqdm(iterator)
        else:
            return iterator


if __name__ == '__main__':
    pass

    # sim = MovementSimulation()
    # outbreak_location = [52.509352, 13.375739]  # P Place
    # # outbreak_location = [52.509352, 13.475739]  # Random
    # # outbreak_location = [52.509352, 33.475739]  # Random

    # outbreak_time = 12
    # sim.run_simulation(outbreak_location, outbreak_time)
    # sim.save_trajectories()
    # breakpoint()
