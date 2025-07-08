import datetime
from celery_setup import celery
from blueprints.v0.utils.mongo_setup import mongo_stats
from bson import ObjectId
from utils.email import notify_admin


@celery.task
def track_api_call_stats(project_id: str, endpoint: str, method: str, db_name: str = None, collection_name: str = None):
    """
    Track daily API call statistics for v0 document endpoints.
    
    Args:
        project_id: The project ID making the API call
        endpoint: The endpoint path (e.g., '/document', '/document/find', '/document/query')
        method: HTTP method (GET, POST, PUT, DELETE)
        db_name: Database name (optional)
        collection_name: Collection name (optional)
    """
    try:
        # Get current date (start of day) for daily aggregation
        today = datetime.datetime.now(datetime.timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        
        # Create a unique identifier for this day/project/endpoint combination
        stats_filter = {
            "date": today,
            "project_id": ObjectId(project_id),
            "endpoint": endpoint,
            "method": method
        }
        
        # Include database and collection info if provided
        if db_name:
            stats_filter["db_name"] = db_name
        if collection_name:
            stats_filter["collection_name"] = collection_name
        
        # Try to update existing record or create new one
        update_result = mongo_stats.update_one(
            stats_filter,
            {
                "$inc": {"call_count": 1},
                "$set": {
                    "last_updated": datetime.datetime.now(datetime.timezone.utc),
                    "project_id": ObjectId(project_id),
                    "endpoint": endpoint,
                    "method": method,
                    "date": today
                },
                "$setOnInsert": {
                    "created_at": datetime.datetime.now(datetime.timezone.utc)
                }
            },
            upsert=True
        )
        
        return {
            "status": "success",
            "project_id": project_id,
            "endpoint": endpoint,
            "method": method,
            "upserted": update_result.upserted_id is not None
        }
        
    except Exception as e:
        error_message = f"Failed to track API call stats for project {project_id}, endpoint {endpoint}: {str(e)}"
        notify_admin(
            subject="API Stats Tracking Error",
            body=error_message
        )
        return {
            "status": "error",
            "message": error_message
        }


@celery.task  
def get_daily_stats_summary(project_id: str, days_back: int = 7):
    """
    Get daily API call statistics summary for a project.
    
    Args:
        project_id: The project ID to get stats for
        days_back: Number of days to look back (default: 7)
    """
    try:
        end_date = datetime.datetime.now(datetime.timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        start_date = end_date - datetime.timedelta(days=days_back)
        
        pipeline = [
            {
                "$match": {
                    "project_id": ObjectId(project_id),
                    "date": {"$gte": start_date, "$lt": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "date": "$date",
                        "endpoint": "$endpoint",
                        "method": "$method"
                    },
                    "total_calls": {"$sum": "$call_count"}
                }
            },
            {
                "$sort": {"_id.date": -1}
            }
        ]
        
        stats = list(mongo_stats.aggregate(pipeline))
        
        return {
            "status": "success",
            "project_id": project_id,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "stats": stats
        }
        
    except Exception as e:
        error_message = f"Failed to get daily stats summary for project {project_id}: {str(e)}"
        notify_admin(
            subject="API Stats Summary Error",
            body=error_message
        )
        return {
            "status": "error",
            "message": error_message
        }
