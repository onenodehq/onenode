from utils.email import notify_admin


def send_feedback_service(email: str, message: str):
    subject = "Feedback from a user"
    body = message + "\n\nUser email adress: " + email + "\n\n-end-"
    notify_admin(subject, body)
    return
