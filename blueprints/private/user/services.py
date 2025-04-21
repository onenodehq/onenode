from uuid import uuid4
from blueprints.v0.utils.mongo_setup import mongo_users, mongo_orgs, mongo_client_cluster
from blueprints.v0.utils.mongo_operations import generate_client_db_id
from blueprints.v0.utils.pinecone_operations import delete_pc_namespaces
from blueprints.v0.utils.s3_operations import delete_s3_objects_with_prefix


def create_user_service(email: str, given_name: str, family_name: str, picture) -> dict:
    try:
        user = mongo_users.find_one({"email": email})
        if not user:
            new_user = {
                "_id": str(uuid4()),
                "email": email,
                "given_name": given_name,
                "family_name": family_name,
                "picture": picture,
            }
            mongo_users.insert_one(new_user)

            return new_user
    except Exception as e:
        raise e
    
def delete_user_service(user_id: str) -> dict:
    user = mongo_users.find_one({"_id": user_id})
    if user:
        mongo_users.delete_one({"_id": user_id})

        orgs = mongo_orgs.find({"owners": {"$in": [user_id]}})
        for org in orgs:
            # Check if the user is the only owner of the organization
            if len(org["owners"]) == 1:
                # Delete all databases under the projects of the organization
                for project in org.get("projects", []):
                    project_id = str(project["_id"])
                    
                    # Delete all S3 objects for this project (entire project directory)
                    delete_s3_objects_with_prefix(f"{project_id}/")
                    
                    for collection in project.get("collections", []):
                        db_name = collection.get("db_name")
                        if db_name:
                            # Generate the database ID and drop the database
                            db_id = generate_client_db_id(project_id, db_name)
                            if db_id in mongo_client_cluster.list_database_names():
                                mongo_client_cluster.drop_database(db_id)
                            
                            # Delete Pinecone namespaces for this database
                            delete_pc_namespaces(project_id, db_name)
                
                # Delete the organization
                mongo_orgs.delete_one({"_id": org["_id"]})
            else:
                # User is not the only owner, just remove the user from the owners list
                mongo_orgs.update_one(
                    {"_id": org["_id"]},
                    {"$pull": {"owners": user["_id"]}}
                )

        return True


def get_user_by_email_service(email: str):
    filter = {"email": {"$eq": email}}
    user: dict = mongo_users.find_one(filter)
    return user


def get_user_by_access_token_service(user_id):
    filter = {"_id": {"$eq": user_id}}
    user: dict = mongo_users.find_one(filter)
    return user
