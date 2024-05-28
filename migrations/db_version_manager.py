import importlib
import os
from migrations.migrate_to_0_1_0 import migrate_to_0_1_0


def read_db_version():
    try:
        with open("db/db_version.txt", "r") as file:
            return file.read().strip()
    except FileNotFoundError:
        return None


def write_db_version(version):
    with open("db/db_version.txt", "w") as file:
        file.write(version)


def check_and_migrate_db():
    current_version = read_db_version()
    expected_version = os.getenv("CURRENT_DB_VERSION")
    re_migrate = os.getenv("RE_MIGRATE") == "True"

    if current_version is None or current_version < expected_version or re_migrate:
        print(
            f"Old database version {current_version}. Expected {expected_version}. Starting migration."
        )
        try:
            # Construct the module name based on the expected version
            module_name = f"migrations.migrate_to_{expected_version.replace('.', '_')}"

            # Dynamically import the module
            migration_module = importlib.import_module(module_name)

            # Get the function from the imported module
            migration_function = getattr(migration_module, "migrate")
            migration_function()

            write_db_version(
                expected_version
            )  # Update version only after successful migration
            print("****Migration completed successfully.****")
            print("current version: ", expected_version)
        except Exception as e:
            print(f"Migration failed: {e}")
    else:
        print("Database version is up-to-date.")
