import flask
from app import app

@app.route('/', methods=['GET'])
def index():
    return flask.render_template('index.html')