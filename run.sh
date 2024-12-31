#!/bin/bash
# run.sh

if [ "$INSTANCE_ROLE" = "beat" ]; then
    # Run celery beat only
    exec celery -A celery_setup beat --loglevel=info
else
    # Run both Flask and Celery worker
    # Start celery worker in the background
    celery -A celery_setup worker --loglevel=info &
    # Start Flask application in the foreground
    exec gunicorn application:application
fi