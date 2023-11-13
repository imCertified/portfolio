import json
from os import getenv
from Invite import InviteModel


def lambda_handler(event, context):
    print(json.dumps(event))

    invite_id = event['pathParameters']['inviteId']

    print(f'Request is for invite ID {invite_id}')
    try:
        invite = InviteModel.get(invite_id)
    except ValueError:
        return {
            'statusCode': 404,
            'body': f'inviteId {invite_id} not found'
        }
    

    
    print(invite.__dict__)

    return {
        'statusCode': 200,
        'body': json.dumps(invite.sanitized()),
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,GET'
        }
    }
