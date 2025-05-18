#!/bin/bash

# Exit on error
set -e

# Log the start of the script
echo "START: Updating pip before installing dependencies"

# Activate the virtual environment
source /var/app/venv/*/bin/activate

# Update pip to the latest version
python3.13 -m pip install --upgrade pip

# Log success
echo "SUCCESS: Updated pip successfully"

# Exit successfully
exit 0 