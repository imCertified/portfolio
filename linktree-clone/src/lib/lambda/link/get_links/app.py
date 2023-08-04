from json import dumps
from utils import (
    NonExistentValueError,
    get_query_param
)
from boto3 import resource
from os import getenv
from Link import Link
from boto3.dynamodb.conditions import Key

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
    res = table.query(
        Limit=30,
        KeyConditionExpression=Key('pk').eq(tree_owner.lower()) & Key('sk').begins_with('LINK#')
    )

    links = []
    try:
        for link in res['Items']:
            links.append(Link.from_ddb_rep(link))
    except KeyError:
        pass  # Leave the list of links empty

    return {
        'statusCode': 200,
        'body': dumps({
            'links': [link.sanitized() for link in links]
        }),
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET'
        }
    }