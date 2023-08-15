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

    # TODO: Need request model
    try:
        Invite.respond(
            table,
            invite_id,
            body
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
