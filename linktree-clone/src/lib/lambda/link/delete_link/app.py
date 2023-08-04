from json import dumps
from utils import (
    NonExistentValueError,
    get_path_param,
    get_user,
    UserNotFoundException,
    assume_with_context
)
from boto3 import client
from os import getenv
from Link import Link
from Tree import UnownedTreeException

sts = client('sts')


def lambda_handler(event, context):
    print(dumps(event))

    try:
        user = get_user(event)
    except UserNotFoundException:
        print('User not found in payload. Returning 403')
        return {
            'statusCode': 403
        }

    print(f'Retrieved user as {user}')

    try:
        link_id = get_path_param(event, 'link')
    except NonExistentValueError:
        print('Path did not include link somehow. This shouldn\'t be possible')
        return {
            'statusCode': 500
        }
    
    try:
        session = assume_with_context(sts=sts, role_arn=getenv('WRITE_ROLE_ARN'), username=user)
        ddb = session.resource('dynamodb')
        table = ddb.Table(getenv('TABLE_NAME'))
        Link.delete_in_table(
            table=table,
            link_id=link_id,
            user=user
        )
    except UnownedTreeException:
        print(f'User {user} does not own link {link_id}. Returning 403')
        return {
            'statusCode': 403,
            'body': 'UnownedTreeException'
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
        }
    }