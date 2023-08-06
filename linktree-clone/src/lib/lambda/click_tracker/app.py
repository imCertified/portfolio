from json import dumps
from utils import (
    NonExistentValueError,
    get_query_param,
    assume_with_context
)
from boto3 import resource, client
from os import getenv
from Click import Click
from Link import Link
from boto3.dynamodb.conditions import Key

sts = client('sts')
ddb = resource('dynamodb')
table = ddb.Table(getenv('TABLE_NAME'))


def lambda_handler(event, context):
    print(dumps(event))
    
    try:
        tree_owner=get_query_param(event, 'user')
    except NonExistentValueError:
        return {
            'statusCode': 400,
            'body': 'user must be specified'
        }
    
    try:
        link_id=get_query_param(event, 'linkId')
    except NonExistentValueError:
        return {
            'statusCode': 400,
            'body': 'user must be specified'
        }

    # This is somewhat risky in this case because we're allowing anonymous users to assume write permissions to a particuilar user's primary keyspace
    # This could be remediated by creating a different write role that only has the ability to write to pk, sk, and clickTime within this user's context, which would prevent the creation of any other kind of object except a Click item
    # This could also be remediated by adjust the Click item attribute structure to avoid putting clicks inside a particular user's keyspace
    # However, since my portfolio is not a high-security environment and this is the only instance of this risky usage, I'm going to keep it the way it is
    click = Click.new(
        username=tree_owner,
        link_id=link_id
    )
    session = assume_with_context(sts=sts, role_arn=getenv('WRITE_ROLE_ARN'), username=tree_owner)
    context_ddb = session.resource('dynamodb')
    context_table = context_ddb.Table(getenv('TABLE_NAME'))
    click.create_in_table(context_table)
    del context_table, context_ddb, session

    return {
        'statusCode': 200,  # Redirect browser
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST'
        }
    }