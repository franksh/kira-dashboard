"""
The Python Backend for the Kira Dashboard

The backend has to be running in the background while the dashboard is used.
The Flask App exposes Api Endpoints to fetch the simulation
data for the dashboard. Data is stored, filtered, and converted in the backend
to reduce the processing load on the dashboard.

Async API setup is described here:
https://stackoverflow.com/a/55440793

Api has the following endpoints:
 - /?name&time: Load data. Returns the snapshot object
 - /run?lat&lon&time: Start a simulation run
 - /status/<task_id>: Get the status of a currently running simulation


"""
import os
import json
import importlib.util
from flask import Flask, request, current_app, abort, url_for
from flask_restful import Resource, Api
from flask_cors import CORS

from functools import wraps
import uuid
import threading
import time
from datetime import datetime

tasks = {}

app = Flask(__name__)
app.config.from_pyfile('config.ini')

# Add Headers to allow cross-origin calls
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)


@app.before_first_request
def before_first_request():
    """Start a background thread that cleans up old tasks."""
    def clean_old_tasks():
        """
        This function cleans up old tasks from our in-memory data structure.
        """
        global tasks
        while True:
            # Only keep tasks that are running or that finished less than 60
            # minutes ago.
            sixty_min_ago = datetime.timestamp(datetime.utcnow()) - 60 * 60
            tasks = {task_id: task for task_id, task in tasks.items()
                     if 'completion_timestamp' not in task or task['completion_timestamp'] > sixty_min_ago}
            time.sleep(60)

    if not current_app.config['TESTING']:
        thread = threading.Thread(target=clean_old_tasks)
        thread.start()


def async_api(wrapped_function):
    @wraps(wrapped_function)
    def new_function(*args, **kwargs):
        def task_call(flask_app, environ):
            # Create a request context similar to that of the original request
            # so that the task can have access to flask.g, flask.request, etc.
            with flask_app.request_context(environ):
                try:
                    tasks[task_id]['return_value'] = wrapped_function(*args, **kwargs)
                except HTTPException as e:
                    tasks[task_id]['return_value'] = current_app.handle_http_exception(e)
                except Exception as e:
                    # The function raised an exception, so we set a 500 error
                    tasks[task_id]['return_value'] = InternalServerError()
                    if current_app.debug:
                        # We want to find out if something happened so reraise
                        raise
                finally:
                    # We record the time of the response, to help in garbage
                    # collecting old tasks
                    tasks[task_id]['completion_timestamp'] = datetime.timestamp(
                        datetime.utcnow())

                    # close the database session (if any)

        # Assign an id to the asynchronous task
        task_id = uuid.uuid4().hex

        # Record the task, and then launch it
        tasks[task_id] = {'task_thread': threading.Thread(
            target=task_call, args=(current_app._get_current_object(),
                                    request.environ))}
        tasks[task_id]['task_thread'].start()

        # Return a 202 response, with a link that the client can use to
        # obtain task status
        print(url_for('gettaskstatus', task_id=task_id))
        return 'accepted', 202, {'Location': url_for('gettaskstatus', task_id=task_id)}
    return new_function


class GetTaskStatus(Resource):
    def get(self, task_id):
        """
        Return status about an asynchronous task. If this request returns a 202
        status code, it means that task hasn't finished yet. Else, the response
        from the task is returned.
        """
        task = tasks.get(task_id)
        if task is None:
            abort(404)
        if 'return_value' not in task:
            return '', 202, {'Location': url_for('gettaskstatus', task_id=task_id)}
        return task['return_value']


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
        -- time: The time of the run
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
        and outbreak time.

        Current valid names are:
        -- PPLACE: Potsdamer Platz
        -- APLACE: Alexanderplatz
        -- OLYMP: Olympiastadion
        -- PPLACE_CLOUD: Cloud simulation based on P Place
        -- CUSTOM: Custom simulation.

        Note: If the name is CUSTOM, time is disregarded

        Times:
        -- 12: Monday 12 pm
        -- 138: Saturday 18 pm
        """
        self.log("Loading snapshot for name={}, time={}".format(name, time))

        snapshots = None

        if name == 'CUSTOM':
            file_format = app.config['FILE_FORMAT_CUSTOM']
            file_name = file_format.format(name)
        else:
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
        return snapshots

    ## UTILITY #########################
    def log(self, msg):
        " Log a message "
        if self.VERBOSE:
            print(msg)


class SimulationRun(Resource):
    """
    Endpoint to trigger a run of the simulation
    """

    def __init__(self):

        # Store module for run simulation method
        api_path = os.path.realpath(__file__)
        sim_path = os.path.dirname(
            os.path.dirname(api_path)) + '/movement-simulation/simulation.py'
        self.SIM_PATH = sim_path

        self.VERBOSE = app.config['VERBOSE']

    @async_api
    def get(self):
        """
        Triggers a simulation run.

        Arguments specify the simulation. Required arguments are:
        -- lat, lon: Coordinates of the outbreak site
        -- time: Time of outbreak
        """
        lat = request.args.get('lat', None)
        lon = request.args.get('lon', None)
        time = request.args.get('time', None)

        self.run_simulation(lat, lon, time)

    def run_simulation(self, lat, lon, time):
        """
        Run a simulation if requested
        """

        outbreak_location = [float(lat), float(lon)]
        outbreak_time = int(time)

        # Load simulation module
        spec = importlib.util.spec_from_file_location(
            "simulation", self.SIM_PATH
        )
        simulation = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(simulation)

        # Trigger simulation run
        sim = simulation.MovementSimulation()
        sim.run_simulation(outbreak_location, outbreak_time)
        sim.save_trajectories(LOCNAME='CUSTOM')

    ## UTILITY #########################
    def log(self, msg):
        " Log a message "
        if self.VERBOSE:
            print(msg)


# api.add_resource(SimulationData, '/<string:location_coords>')
api.add_resource(SimulationData, '/')
api.add_resource(SimulationRun, '/run/')
api.add_resource(GetTaskStatus, '/status/<task_id>')


if __name__ == '__main__':
    app.run(debug=True)
