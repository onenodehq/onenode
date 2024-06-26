from blueprints.v1.utils.s3_setup import EXTENSION_MAP, S3_BUCKET_NAME, s3

def upload_to_s3(file_binary, filename, content_type):
    s3.upload_fileobj(
        file_binary, S3_BUCKET_NAME, filename, ExtraArgs={"ContentType": content_type}
    )

def generate_signed_url(object_key, expiration=3600):
    """
    Generate a signed URL for an S3 object.
    
    :param bucket_name: The name of the S3 bucket.
    :param object_key: The key of the S3 object. ex) 'path/to/user-content.jpg'
    :param expiration: Time in seconds for the signed URL to remain valid (default: 3600 seconds).
    :return: The signed URL as a string.
    """
    try:
        signed_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': object_key},
            ExpiresIn=expiration
        )
        return signed_url
    except Exception as e:
        raise RuntimeError(e)