"""
The Python Backend for the Kira Dashboard

The backend has to be running in the background while the dashboard is used.
The Flask App exposes Api Endpoints to fetch the simulation
data for the dashboard. Data is stored, filtered, and converted in the backend
to reduce the processing load on the dashboard.
"""
import os
import json
from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS

app = Flask(__name__)
app.config.from_pyfile('config.ini')

# Add Headers to allow cross-origin calls
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)


class SimulationData(Resource):
    """
    Endpoint to retrieve the simulation data
    """

    def __init__(self):

        # Get relative path to data dir
        api_path = os.path.realpath(__file__)
        data_path = os.path.dirname(
            os.path.dirname(api_path)) + '/data/output/'
        self.DATA_PATH = data_path

        self.VERBOSE = app.config['VERBOSE']

    ## API INPUT/OUTPUT ##########################

    def get(self):
        """
        Returns the simulation data.
        Depending on the input, this either:
        - runs a simulation (to be implemented)
        - loads data of a previously run simulation for some specific sites
        - loads default data if everything else fails

        Arguments can be used to filter the data. Input parameters are:
        -- name: Short name of the previously run simulation / scenario
        """
        # Load request parameters
        name = request.args.get('name', None)
        time = request.args.get('time', None)

        # Load data
        snapshots = None
        # Try loading if name given
        if name is not None:
            snapshots = self.load_snapshot(name, time)

        # If no snapshots could be loaded with the given arguments,
        # load default data as backup
        if not snapshots:
            snapshots = self.load_default_data()

        return snapshots

    ## DATA INPUT / OUTPUT ###############################

    def load_default_data(self):
        """
        Load default data from disk if arguments fail
        """

        self.log("Loading default data")
        data_file = self.DATA_PATH + app.config['DATA_FILE_DEFAULT']
        self.log(" - Loading file {}".format(data_file))
        with open(data_file, 'r') as read_file:
            snapshots_json = json.load(read_file)

        snapshots = snapshots_json['snapshots']
        return snapshots

    def load_snapshot(self, name, time):
        """
        Load a snapshot from disk, that is identifiable by a specific name
        and outbreak time

        Current valid names are:
        -- PPLACE: Potsdamer Platz
        -- APLACE: Alexanderplatz
        -- OLYMP: Olympiastadion
        -- PPLACE_CLOUD: Cloud simulation based on P Place

        Times:
        -- 12: Monday 12 pm
        -- 138: Saturday 18 pm
        """
        self.log("Loading snapshot for name={}, time={}".format(name, time))

        snapshots = None

        file_format = app.config['FILE_FORMAT']
        file_name = file_format.format(name, time)
        file_path = self.DATA_PATH + file_name
        try:
            with open(file_path, 'r') as read_file:
                snapshots_json = json.load(read_file)
            snapshots = snapshots_json['snapshots']
            self.log(" - Loaded file {}".format(file_path))
        except FileNotFoundError:
            self.log(" - no file found for given name: " + file_path)
            snapshots = self.load_default_data()
        # if name == 'PPLACE':
        #     data_file = self.DATA_PATH + app.config['DATA_FILE_PPLACE']
        #     self.log(" - Loading file {}".format(data_file))
        #     with open(data_file, 'r') as read_file:
        #         snapshots_json = json.load(read_file)
        #     snapshots = snapshots_json['snapshots']
        # elif name == 'APLACE':
        #     data_file = self.DATA_PATH + app.config['DATA_FILE_APLACE']
        #     self.log(" - Loading file {}".format(data_file))
        #     with open(data_file, 'r') as read_file:
        #         snapshots_json = json.load(read_file)
        #     snapshots = snapshots_json['snapshots']
        # elif name == 'OLYMP':
        #     data_file = self.DATA_PATH + app.config['DATA_FILE_OLYMP']
        #     self.log(" - Loading file {}".format(data_file))
        #     with open(data_file, 'r') as read_file:
        #         snapshots_json = json.load(read_file)
        #     snapshots = snapshots_json['snapshots']
        # else:
        return snapshots

    ## UTILITY #########################
    def log(self, msg):
        """
        Logging for debugging.
        At the moment print to console if verbose
        """
        if self.VERBOSE:
            print(msg)


# api.add_resource(SimulationData, '/<string:location_coords>')
api.add_resource(SimulationData, '/')

if __name__ == '__main__':
    app.run(debug=True)
