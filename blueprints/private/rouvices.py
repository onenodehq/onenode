from blueprints.v1.utils.mongo_setup import mongo_users
from utils.email import notify_admin


def send_feedback_service(onenode_id: str, message: str) -> None:
    subject = "Feedback from a user"

    # Fetch user information from the database
    user = mongo_users.find_one({"_id": onenode_id})

    if not user:
        raise ValueError(f"User with ID {onenode_id} not found.")

    # Construct email body using f-strings for clarity
    body = (
        f"{message}\n"
        f"User email address: {user.get('email', 'N/A')}\n"
        f"User Name: {user.get('given_name', 'N/A')}\n\n"
        f"-end-"
    )

    # Notify admin via email
    notify_admin(subject, body)
