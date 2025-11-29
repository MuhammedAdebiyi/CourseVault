import boto3
from django.conf import settings
from datetime import datetime, timedelta

def generate_presigned_url(file_key, expires_in=3600):
    s3_client = boto3.client(
        "s3",
        region_name="auto",
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )

    url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": file_key},
        ExpiresIn=expires_in
    )
    return url
