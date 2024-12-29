worker: celery -A celery_setup worker --loglevel=info
web: gunicorn application:application
beat: celery -A celery_setup beat --loglevel=info