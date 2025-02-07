import logging
import os
from dotenv import load_dotenv

load_dotenv()


# Get log level from environment variable or default to 'WARNING'
log_level = os.getenv("LOG_LEVEL", "WARNING").upper()
numeric_level = getattr(logging, log_level, None)
# Configure logging
logging.basicConfig(
    level=numeric_level, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
