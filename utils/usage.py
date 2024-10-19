# Start the first job with a random minute within the current hour
import datetime
import random
from sched import scheduler
from apscheduler.triggers.date import DateTrigger

def start_usage_scheduler():
    current_time = datetime.datetime.now()
    next_minute = random.randint(0, 59)
    next_run_time = current_time.replace(minute=next_minute, second=0, microsecond=0)
    scheduler.add_job(check_usage, trigger=DateTrigger(run_date=next_run_time))
    print(f"First job scheduled at: {next_run_time}")
    scheduler.start()


def check_usage():
    print(f"Job executed at: {datetime.datetime.now()}")
    # Calculate next random time within the next hour
    current_time = datetime.datetime.now()
    next_minute = random.randint(0, 59)
    next_run_time = (current_time + datetime.timedelta(hours=1)).replace(minute=next_minute, second=0, microsecond=0)

    # Schedule the next run
    scheduler.add_job(check_usage, trigger=DateTrigger(run_date=next_run_time))
    print(f"Next job scheduled at: {next_run_time}")

