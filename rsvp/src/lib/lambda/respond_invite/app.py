import json
import boto3
from os import getenv
from Invite import Invite

ddb = boto3.resource('dynamodb')
table = ddb.Table(getenv('TABLE_NAME'))


def lambda_handler(event, context):
    print(json.dumps(event))

    body = json.loads(event['body'])
    invite_id = event['pathParameters']['inviteId']
    attending = body['attending']
    plus_one = body['plusOne']
    print(f'{invite_id=}')
    print(f'{attending=}')
    print(f'{plus_one=}')

    try:
        Invite.respond(
            table=table,
            invite_id=invite_id,
            attending=attending,
            plus_one=plus_one
        )
    except ValueError:
        return {
            'statusCode': 404
        }

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT'
        }
    }
