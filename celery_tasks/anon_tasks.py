import datetime
from celery_setup import celery
from blueprints.v0.utils.mongo_setup import mongo_orgs, mongo_client_cluster
from blueprints.v0.utils.mongo_operations import generate_client_db_id
from blueprints.v0.utils.pinecone_operations import delete_pc_namespaces
from blueprints.v0.utils.s3_operations import delete_s3_objects_with_prefix, generate_object_key_prefix
from utils.email import notify_admin
from blueprints.v0.utils.anon_operations import get_or_create_anon_org


@celery.task
def cleanup_expired_anon_projects():
    try:
        cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)
        
        anon_org = get_or_create_anon_org()
        
        projects_to_delete = []
        projects_to_keep = []
        deleted_count = 0
        error_count = 0
        
        for project in anon_org.get("projects", []):
            project_created_at = project["created_at"]
            if project_created_at.tzinfo is None:
                project_created_at = project_created_at.replace(tzinfo=datetime.timezone.utc)
            else:
                project_created_at = project_created_at.astimezone(datetime.timezone.utc)
            
            if project_created_at < cutoff_date:
                projects_to_delete.append(project)
            else:
                projects_to_keep.append(project)

        if not projects_to_delete:
            return {
                "status": "success",
                "message": "No old anon projects found to delete",
                "deleted_count": 0,
                "error_count": 0
            }
        
        for project in projects_to_delete:
            project_id = str(project["_id"])
            
            try:
                delete_s3_objects_with_prefix(generate_object_key_prefix(project_id))
                
                for collection in project.get("collections", []):
                    db_name = collection["db_name"]
                    try:
                        db_id = generate_client_db_id(project_id, db_name)
                        if db_id in mongo_client_cluster.list_database_names():
                            mongo_client_cluster.drop_database(db_id)
                        
                        delete_pc_namespaces(project_id, db_name)
                        
                    except Exception as db_error:
                        error_count += 1
                        notify_admin(
                            "Anon Cleanup Database Error",
                            f"Failed to delete database {db_name} for project {project_id}: {str(db_error)}"
                        )
                
                deleted_count += 1
                mongo_orgs.update_one(
                    {"_id": anon_org["_id"]},
                    {"$pull": {"projects": project}}
                )
                
            except Exception as project_error:
                error_count += 1
                notify_admin(
                    "Anon Cleanup Project Error",
                    f"Failed to cleanup project {project_id}: {str(project_error)}"
                )
        
        return {
            "status": "success",
            "message": f"Cleaned up {deleted_count} old anon projects",
            "deleted_count": deleted_count,
            "error_count": error_count
        }
        
    except Exception as e:
        error_message = f"Critical error in cleanup_old_anon_projects task: {str(e)}"
        notify_admin(
            "Critical Anon Cleanup Error",
            error_message
        )
        return {
            "status": "error",
            "message": error_message,
            "deleted_count": 0,
            "error_count": 1
        }
