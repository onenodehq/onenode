import os


def get_db_path():
    app_dir = os.path.dirname(os.path.abspath(__file__))
    db_dir_name = "db/chroma"
    db_path = os.path.join(app_dir, db_dir_name)
    return db_path
