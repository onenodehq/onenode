import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the sender email password from environment variables
EMAIL_SENDER_PASSWORD = os.getenv("EMAIL_SENDER_PASSWORD")


def notify_admin(subject: str, body: str):
    # Email settings
    sender_email = "no-reply@onenode.ai"
    sender_password = EMAIL_SENDER_PASSWORD  # Use App Password if 2FA is enabled
    admin_email = "tomo@onenode.ai"

    # Create a MIMEText message
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = admin_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP("smtp.gmail.com", 587)  # Use 465 for SSL, or 587 for TLS
    server.starttls()  # Secure the connection (only for TLS on port 587)
    server.login(sender_email, sender_password)  # Login with App Password
    server.sendmail(sender_email, admin_email, msg.as_string())
    server.quit()