import datetime
from celery_setup import celery
from blueprints.v0.utils.mongo_setup import mongo_stats, mongo_orgs, mongo_usage
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


@celery.task
def send_daily_admin_report():
    """
    Send a comprehensive daily report to admin with system statistics.
    
    This task generates a report containing:
    - API call statistics (yesterday and last 7 days)
    - Storage usage statistics
    - New projects created
    - Overall system health metrics
    """
    try:
        # Get yesterday's date range
        yesterday = datetime.datetime.now(datetime.timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        ) - datetime.timedelta(days=1)
        today = yesterday + datetime.timedelta(days=1)
        
        # Get last 7 days range
        week_ago = yesterday - datetime.timedelta(days=6)
        
        # === API CALL STATISTICS ===
        
        # Yesterday's API calls
        yesterday_stats = list(mongo_stats.aggregate([
            {
                "$match": {
                    "date": {"$gte": yesterday, "$lt": today}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_calls": {"$sum": "$call_count"},
                    "unique_projects": {"$addToSet": "$project_id"},
                    "endpoints": {"$addToSet": "$endpoint"}
                }
            }
        ]))
        
        # Last 7 days API calls
        weekly_stats = list(mongo_stats.aggregate([
            {
                "$match": {
                    "date": {"$gte": week_ago, "$lt": today}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_calls": {"$sum": "$call_count"},
                    "unique_projects": {"$addToSet": "$project_id"},
                    "unique_days": {"$addToSet": "$date"}
                }
            }
        ]))
        
        # Top endpoints yesterday
        top_endpoints = list(mongo_stats.aggregate([
            {
                "$match": {
                    "date": {"$gte": yesterday, "$lt": today}
                }
            },
            {
                "$group": {
                    "_id": {"endpoint": "$endpoint", "method": "$method"},
                    "total_calls": {"$sum": "$call_count"}
                }
            },
            {
                "$sort": {"total_calls": -1}
            },
            {
                "$limit": 5
            }
        ]))
        
        # Top projects yesterday
        top_projects = list(mongo_stats.aggregate([
            {
                "$match": {
                    "date": {"$gte": yesterday, "$lt": today}
                }
            },
            {
                "$group": {
                    "_id": "$project_id",
                    "total_calls": {"$sum": "$call_count"}
                }
            },
            {
                "$sort": {"total_calls": -1}
            },
            {
                "$limit": 5
            }
        ]))
        
        # === STORAGE USAGE STATISTICS ===
        
        # Latest usage snapshot
        latest_usage = list(mongo_usage.aggregate([
            {
                "$sort": {"timestamp": -1}
            },
            {
                "$group": {
                    "_id": "$project_id",
                    "latest_usage": {"$first": "$$ROOT"}
                }
            },
            {
                "$replaceRoot": {"newRoot": "$latest_usage"}
            }
        ]))
        
        total_storage = sum(doc.get("mongo_total_mb", 0) for doc in latest_usage)
        total_pinecone = sum(doc.get("pc_mb", 0) for doc in latest_usage)
        
        # === PROJECT STATISTICS ===
        
        # New projects created yesterday
        new_projects = list(mongo_orgs.aggregate([
            {
                "$unwind": "$projects"
            },
            {
                "$match": {
                    "projects.created_at": {"$gte": yesterday, "$lt": today}
                }
            },
            {
                "$project": {
                    "org_name": "$name",
                    "project_name": "$projects.name",
                    "created_at": "$projects.created_at"
                }
            }
        ]))
        
        # Total projects count
        total_projects = list(mongo_orgs.aggregate([
            {
                "$unwind": "$projects"
            },
            {
                "$count": "total"
            }
        ]))
        
        # Total organizations count
        total_orgs = mongo_orgs.count_documents({})
        
        # === GENERATE REPORT ===
        
        # Format yesterday's stats
        yesterday_calls = yesterday_stats[0]["total_calls"] if yesterday_stats else 0
        yesterday_projects = len(yesterday_stats[0]["unique_projects"]) if yesterday_stats else 0
        yesterday_endpoints = len(yesterday_stats[0]["endpoints"]) if yesterday_stats else 0
        
        # Format weekly stats
        weekly_calls = weekly_stats[0]["total_calls"] if weekly_stats else 0
        weekly_projects = len(weekly_stats[0]["unique_projects"]) if weekly_stats else 0
        weekly_avg_calls = weekly_calls / 7 if weekly_calls > 0 else 0
        
        # Format top endpoints
        top_endpoints_text = "\n".join([
            f"  {i+1}. {item['_id']['method']} {item['_id']['endpoint']}: {item['total_calls']} calls"
            for i, item in enumerate(top_endpoints)
        ]) if top_endpoints else "  No API calls yesterday"
        
        # Format top projects
        top_projects_text = "\n".join([
            f"  {i+1}. Project {str(item['_id'])}: {item['total_calls']} calls"
            for i, item in enumerate(top_projects)
        ]) if top_projects else "  No API calls yesterday"
        
        # Format new projects
        new_projects_text = "\n".join([
            f"  • {item['project_name']} (Org: {item['org_name']}) - Created: {item['created_at'].strftime('%Y-%m-%d %H:%M:%S UTC')}"
            for item in new_projects
        ]) if new_projects else "  No new projects created yesterday"
        
        # Total counts
        total_project_count = total_projects[0]["total"] if total_projects else 0
        
        # Build report
        report_date = yesterday.strftime('%Y-%m-%d')
        report_body = f"""
OneNode Daily System Report - {report_date}
=====================================

📊 API ACTIVITY SUMMARY
-----------------------
Yesterday ({report_date}):
  • Total API calls: {yesterday_calls:,}
  • Active projects: {yesterday_projects}
  • Unique endpoints used: {yesterday_endpoints}

Last 7 days:
  • Total API calls: {weekly_calls:,}
  • Active projects: {weekly_projects}
  • Average daily calls: {weekly_avg_calls:.1f}

🔥 TOP ENDPOINTS (Yesterday)
----------------------------
{top_endpoints_text}

🏆 TOP PROJECTS (Yesterday)
---------------------------
{top_projects_text}

💾 STORAGE USAGE
----------------
  • Total MongoDB storage: {total_storage:.2f} MB
  • Total Pinecone storage: {total_pinecone:.2f} MB
  • Active projects with data: {len(latest_usage)}

🆕 NEW PROJECTS (Yesterday)
---------------------------
{new_projects_text}

📈 SYSTEM OVERVIEW
------------------
  • Total organizations: {total_orgs:,}
  • Total projects: {total_project_count:,}
  • Projects created yesterday: {len(new_projects)}

Report generated: {datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
"""
        
        # Send email
        notify_admin(
            subject=f"OneNode Daily Report - {report_date}",
            body=report_body
        )
        
        return {
            "status": "success",
            "report_date": report_date,
            "yesterday_calls": yesterday_calls,
            "weekly_calls": weekly_calls,
            "new_projects": len(new_projects),
            "total_projects": total_project_count,
            "total_orgs": total_orgs
        }
        
    except Exception as e:
        error_message = f"Failed to generate daily admin report: {str(e)}"
        notify_admin(
            subject="Daily Report Generation Error",
            body=error_message
        )
        return {
            "status": "error",
            "message": error_message
        }
