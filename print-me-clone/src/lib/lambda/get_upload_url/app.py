import json
from utilities import get_path_param, get_body_param, NonExistentValueError
from Document import Document
import boto3
from os import getenv

ddb = boto3.resource('dynamodb')
table = ddb.Table(getenv('TABLE_NAME'))
s3 = boto3.client('s3')


def lambda_handler(event, context):
    print(json.dumps(event))

    # Get Job ID
    try:
        job_id = get_path_param(event, 'jobId')
    except NonExistentValueError:
        return {
            'statusCode': 404,
            'body': 'jobId must be provided'
        }

    # Get Friendly Name
    try:
        friendly_name = get_body_param(event, 'friendlyName', str)
    except NonExistentValueError:
        return {
            'statusCode': 404,
            'body': 'friendlyName must be provided'
        }

    new_doc = Document.new(job_id, friendly_name)

    url = s3.generate_presigned_url(
        f'put_object',
        Params={
            'Bucket': getenv('DOC_BUCKET'),
            'Key': f'{job_id}/{new_doc.document_id}',
        },
        ExpiresIn=30,
        HttpMethod='PUT'
    )

    if not url:
        return {
            'statusCode': 503
        }

    new_doc.create_in_table(table)

    return {
        'statusCode': 200,
        'body': url
    }
