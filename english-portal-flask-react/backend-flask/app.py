from flask import Flask
from flask_cors import CORS
from lib.db import db
import os

def create_app(test_config=None):
    app = Flask(__name__)
    
    # Enable CORS with specific origins
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Configure app
    app.config.from_mapping(
        DATABASE=os.path.join(app.instance_path, 'words.db'),
    )

    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.update(test_config)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Register database functions
    @app.teardown_appcontext
    def close_db(e=None):
        db.close()

    # Import and register blueprints
    from routes import dashboard, groups, words, study_sessions, study_activities
    
    # Register blueprints
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(groups.bp)
    app.register_blueprint(words.bp)
    app.register_blueprint(study_sessions.bp)
    app.register_blueprint(study_activities.bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='127.0.0.1', port=5000)