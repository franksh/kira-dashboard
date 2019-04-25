# AngularKiraDashboardV01

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.5 (but its 7.0.1 now).

## Quick start

Start the Python backend

```
python flask-backend/api/api.py
```

Then start the Angular Dashboard in a separate process

```
ng serve
```

The dashboard is available at `http://localhost:4200/`.

## Python Flask Backend

Data is served by a Flask API in the folder `flask-backend/`.
Before you run the Angular App, start the Flask API in a seperate process.

### Running the Backend

First, install the required Python packages,

```
pip install -r flask-backend/requirements.txt
```

Then you can run the API using

```
python flask-backend/api/api.py
```

### Backend developement using virtualenv

During development, use virtualenv to keep the requirements file accurate.
Create a virtual environment `virtualenv flask-backend/venv` and
activate it using `source /flask-backend/venv/bin/activate`.

Install required Python packages as usual. When you're finished,
update the requirements file with `pip freeze > flask-backend/requirements.txt`

## Angular Dashboard

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

To run with production environment, run

`ng serve --prod`

The configurations for the environments can be set in the `environments/` directory.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
