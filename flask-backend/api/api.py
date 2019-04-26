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
import pandas as pd
import numpy as np

app = Flask(__name__)
app.config.from_pyfile('config.ini')

# Add Headers to allow cross-origin calls
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)


def initialize_api():
    """
    Initialize the API when starting. Load data from disk, etc.
    """
    pass


## DATA INPUT / OUTPUT ###############################

def load_data():
    """
    Load the data from disk
    """
    # Get relative path to data dir
    api_path = os.path.realpath(__file__)
    data_path = os.path.dirname(os.path.dirname(api_path)) + '/data/output/'

    # data_file = "FEPR_trajectories_N100_T168_real.csv"
    data_file = app.config['DATA_FILE']

    with open(data_path + data_file, 'r') as read_file:
        snapshots_json = json.load(read_file)

    snapshots = snapshots_json['snapshots']
    return snapshots


class SimulationData(Resource):
    """
    Endpoint to retrieve the simulation data
    """

    def get(self):
        """
        Returns the simulation data

        Input parameters can be used to filter the data. Input parameters are:
        -- lat: Outbreak site latitude
        -- lon: Outbreak site longitude
        -- time: The hour in which the outbreak happened, counted from Monday
        """

        # At the moment, just load the data from file
        snapshots = load_data()

        # default_loc = app.config['LOCATION_POTSDAMER_PLATZ']
        # lat = request.args.get('lat', default=None, type=float)
        # lon = request.args.get('lon', default=None, type=float)
        # time = request.args.get('time', default=132, type=int)

        # df = api.df

        # # Filter data if site is given
        # if lat and lon:
        #     df = filter_data_for_outbreak_location_and_time(df, lat, lon, time)

        # # Convert to Angular format
        # snapshots = convert_data_for_dashboard(df)

        # print(
        #     "Outbreak site used:\
        #     \nlat: {}\tlon: {}\ttime: {}".format(lat, lon, time)
        # )

        return snapshots


# api.add_resource(SimulationData, '/<string:location_coords>')
api.add_resource(SimulationData, '/')

if __name__ == '__main__':
    initialize_api()
    app.run(debug=True)
