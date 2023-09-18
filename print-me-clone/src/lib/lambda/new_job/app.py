import json
from utilities import get_body_param, NonExistentValueError
from Job import Job
import boto3
from os import getenv

ddb = boto3.resource('dynamodb')
table = ddb.Table(getenv('TABLE_NAME'))


def lambda_handler(event, context):
    print(json.dumps(event))

    try:
        friendly_name = get_body_param(event, 'friendlyName', str)
    except NonExistentValueError:
        # A friendly name is not necessary and is happily left as None
        friendly_name = None

    # Create new job and persist it
    new_job = Job.new(friendly_name=friendly_name)
    new_job.create_in_table(table)

    return {
        'statusCode': 200,
        'body': json.dumps({
            'jobId': new_job.job_id
        })
    }