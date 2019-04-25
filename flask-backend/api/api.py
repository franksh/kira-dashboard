"""
The Python Backend for the Kira Dashboard

The backend has to be running in the background while the dashboard is used.
The Flask App exposes Api Endpoints to fetch the simulation
data for the dashboard. Data is stored, filtered, and converted in the backend
to reduce the processing load on the dashboard.
"""
import os
from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
app.config.from_pyfile('config.cfg')

# Add Headers to allow cross-origin calls
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)


def initialize_api():
    """
    Initialize the API when starting. Load data from disk, etc.
    """
    api.df = load_data()


def load_data():
    """
    Loads the raw data from disk,
    as output by the movement simulation.

    Raw data has the format:
    time | individual | lat | lon
    """
    # Get relative path to data dir
    api_path = os.path.realpath(__file__)
    data_path = os.path.dirname(os.path.dirname(api_path)) + '/data/'

    # data_file = "FEPR_trajectories_N100_T168_real.csv"
    data_file = app.config['DATA_FILE']

    df = pd.read_csv(data_path + data_file)
    # print(df.head())
    return df


def convert_data_for_dashboard(df):
    """
    Processes the data (as loaded form disk) 
    into the format used in angular.

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
    # Round time to nearest hour
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
    df = df.fillna(method='ffill')

    # Convert dataframe to key-value pair (timestamp-points) as
    # as is required from Angular
    n_times = df.shape[0]
    n_ind = int(df.shape[1]/2)
    vals = np.flip(df.values, axis=1)  # Switch lat and lon
    points_all = vals.reshape(n_times, n_ind, 2).tolist()

    snapshots = []
    for timestamp, points in zip(df.index, points_all):
        snapshots.append({
            'timestamp': timestamp,
            'points': points
        })
    return snapshots


class SimulationData(Resource):
    """
    Endpoint to retrieve the simulation data
    """

    def get(self):
        """
        Returns the simulation data
        """
        # TODO: Implement data filtering here
        df = api.df

        # Convert to Angular formap
        snapshots = convert_data_for_dashboard(df)
        return snapshots


api.add_resource(SimulationData, '/')

if __name__ == '__main__':
    initialize_api()
    app.run(debug=True)
