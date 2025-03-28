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
    alias_email = "no-reply@capydb.com"  # The alias to show as sender
    primary_email = "tomo@capydb.com"  # The primary account used for authentication
    sender_password = EMAIL_SENDER_PASSWORD  # Use App Password if 2FA is enabled

    # Create a MIMEText message
    msg = MIMEMultipart()
    msg["From"] = alias_email
    msg["To"] = primary_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    # Connect to Gmail's SMTP server and send email
    server = smtplib.SMTP("smtp.gmail.com", 587)  # Use 465 for SSL or 587 for TLS
    server.starttls()  # Secure the connection (for TLS on port 587)
    server.login(primary_email, sender_password)  # Login using the primary account
    server.sendmail(primary_email, primary_email, msg.as_string())
    server.quit()
