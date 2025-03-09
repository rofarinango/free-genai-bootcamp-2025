from invoke import task
from app import create_app
from lib.db import db

@task
def init_db(ctx):
    """Initialize the database."""
    app = create_app()
    with app.app_context():
        db.init(app)
    print("Database initialized successfully.") 