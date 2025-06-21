from blueprints.v0.utils.mongo_setup import mongo_users
from errors import AuthError
from utils.email import notify_admin
from bson import ObjectId
from blueprints.v0.utils.mongo_setup import mongo_orgs


def send_feedback_service(user_id: str, message: str) -> None:
    subject = "Feedback from a user"

    # Fetch user information from the database
    user = mongo_users.find_one({"_id": user_id})

    if not user:
        raise ValueError(f"User with ID {user_id} not found.")

    # Construct email body using f-strings for clarity
    body = (
        f"{message}\n"
        f"User email address: {user.get('email', 'N/A')}\n"
        f"User Name: {user.get('given_name', 'N/A')}\n\n"
        f"-end-"
    )

    # Notify admin via email
    notify_admin(subject, body)


def send_docs_feedback_service(message: str) -> None:
    subject = "Feedback from a user about docs"

    # Construct email body using f-strings for clarity
    body = f"{message}\n" f"-end-"

    # Notify admin via email
    notify_admin(subject, body)


def check_project_permission(
    user_id: str, org_id: str, project_id: str, role: str = "owners"
):
    query = {
        "_id": ObjectId(
            org_id
        ),  # Use this line if _id is of type ObjectId, otherwise use "_id": org_id
        "projects": {"$elemMatch": {"_id": ObjectId(project_id), role: user_id}},
    }

    org = mongo_orgs.find_one(query)

    if not org:
        raise AuthError(
            "Access denied: User lacks permission for the specified project."
        )

    return True

def check_org_permission(
    user_id: str, org_id: str, role: str = "owners"
):
    query = {
        "_id": ObjectId(org_id),
        role: user_id  # Check if user_id is in the specified role array
    }
    
    org = mongo_orgs.find_one(query)
    
    if not org:
        raise AuthError(
            "Access denied: User lacks permission for the specified organization."
        )
    
    return True