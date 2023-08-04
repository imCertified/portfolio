from json import dumps
from utils import (
    get_body_param,
    get_user,
    assume_with_context,
    UserNotFoundException,
    NonExistentValueError
)
from boto3 import client
from os import getenv
from Link import Link

sts = client('sts')  # For assuming context-aware role


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

    # TODO: Replace all of this with an APIGW model
    try:
        url = get_body_param(event, 'url', parser=str)
    except NonExistentValueError:
        print('Body did not include url. Returning 400')
        return {
            'statusCode': 400,
            'body': 'Body must include a url'
        }

    try:
        display_text = get_body_param(event, 'displayText', parser=str)
    except NonExistentValueError:
        print('Body did not include displayText. Returning 400')
        return {
            'statusCode': 400,
            'body': 'Body must include a displayText'
        }
    
    try:
        is_explicit = get_body_param(event, 'isExplicit')
        if type(is_explicit) != bool:
            return {
                'statusCode': 400,
                'body': 'isExplicit must be boolean'
            }
    except NonExistentValueError:
        print('Body did not include isExplicit. Returning 400')
        return {
            'statusCode': 400,
            'body': 'Body must include isExplicit'
        }

    # TODO: Validate URL is of proper format
    link = Link.new(
        username=user,
        url=url,
        display_text=display_text,
        is_explicit=is_explicit
    )
    try:
        # Assume role with write access at the last possible moment
        session = assume_with_context(sts=sts, role_arn=getenv('WRITE_ROLE_ARN'), username=user)
        ddb = session.resource('dynamodb')
        table = ddb.Table(getenv('TABLE_NAME'))
        link.create_in_table(table)
        del ddb, table, session  # Destroy resources to disallow usage on next execution, just to be safe
    except UnownedTreeException:
        print(f'User {user} does not own tree abc123. Returning 403')
        return {
            'statusCode': 403,
            'body': 'UnownedTreeException'
        }

    return {
        'statusCode': 200,
        'body': dumps({
            'link': link.sanitized()
        }),
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'PUT'
        }
    }
