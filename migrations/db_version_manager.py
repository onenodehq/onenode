import os
from migrations.migrate_to_0_1_0 import migrate_to_0_1_0

def read_db_version():
    try:
        with open('migrations/db_version.txt', 'r') as file:
            return file.read().strip()
    except FileNotFoundError:
        return None
    
def write_db_version(version):
    with open('migrations/db_version.txt', 'w') as file:
        file.write(version)

def check_and_migrate_db():
    current_version = read_db_version()
    expected_version = os.getenv("CURRENT_DB_VERSION")

    if current_version is None or current_version < expected_version:
        print(f"Old database version {current_version}. Expected {expected_version}. Starting migration.")
        try:
            migrate_to_0_1_0()  # Call your custom migrate function
            write_db_version(expected_version)  # Update version only after successful migration
            print("****Migration completed successfully.****")
        except Exception as e:
            print(f"Migration failed: {e}")
    else:
        print("Database version is up-to-date.")