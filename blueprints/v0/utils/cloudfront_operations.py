# your_script.py

import os
from datetime import datetime, timedelta, UTC
from botocore.signers import CloudFrontSigner
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from blueprints.v0.utils.secret_menager_operations import get_secret
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend


private_key0 = get_secret()
# Deserialize the private key
private_key = serialization.load_pem_private_key(
    private_key0.encode("utf-8"), password=None, backend=default_backend()
)
SIGNED_URL_EXPIRATION = int(os.getenv("SIGNED_URL_EXPIRATION"))
CLOUDFRONT_DOMAIN = os.getenv("CLOUDFRONT_DOMAIN")
PUBLIC_KEY_ID=os.getenv("PUBLIC_KEY_ID")


def rsa_signer(message):
    return private_key.sign(
        message,
        padding=padding.PKCS1v15(),
        algorithm=hashes.SHA1(),  # Only SHA1 is accepted by AWS CloudFront
    )


def generate_cloudfront_signed_url(object_key):
    url = f"https://{CLOUDFRONT_DOMAIN}/{object_key}"
    expiration = SIGNED_URL_EXPIRATION

    # Create a CloudFront signer
    cloudfront_signer = CloudFrontSigner(key_id=PUBLIC_KEY_ID, rsa_signer=rsa_signer)

    # Generate a signed URL with an expiration date
    expiration_date = datetime.now(UTC) + timedelta(seconds=expiration)
    signed_url = cloudfront_signer.generate_presigned_url(
        url, date_less_than=expiration_date
    )
    return signed_url
