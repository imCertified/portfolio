import json
import boto3
import os
from uuid import uuid4
from boto3.dynamodb.conditions import Key
import datetime

# Think of this script like a testing script
# We will be making requests and asserting that no data is being leaked

def lambda_handler(event, context):
    print(json.dumps(event))

    my_tenant = 'tenant1'

    session = create_temp_tenant_session(
        access_role_arn=os.getenv('ACCESS_ROLE_ARN'),
        session_name='ExampleAssumptionSession',
        tenant_id=my_tenant,
        duration_sec=900
    )

    ddb = session.resource('dynamodb')
    table = ddb.Table(os.getenv('ASSUMPTION_TABLE_NAME'))

    # Get an item that should exist and definitely belongs to this tenant
    print('Getting item that should belong to me!')
    res = table.get_item(
        Key={
            'pk': my_tenant,
            'sk': 'tenantsk2'
        }
    )
    print(res)

    # Attempt to retrieve an item that does not belong to this tenant
    print('Getting item that should not belong to me!')
    try:
        res = table.get_item(
            Key={
                'pk': 'tenant2',
                'sk': 'tenantsk2'
            }
        )
        # If it let's us do this, that's bad
        raise AssertionError
    except Exception as e:
        print('GOOD!')
        pass

    # Scan the whole table, which should error out because dynamodb:Scan is not allowed
    print('Scanning table!')
    try:
        res = table.scan()
    except Exception as e:
        print('GOOD!')
    
    # Attempt to put an item with our tenant ID, which should work
    print('Putting item with my tenant ID')
    table.put_item(
        Item={
            'pk': my_tenant,
            'sk': str(uuid4()),
            'timestamp': datetime.datetime.now().isoformat()
        }
    )
    
    # Attempt to put an item with a different tenant ID, which should not work
    print('Putting item with someone else\'s tenant ID')
    try:
        table.put_item(
            Item={
                'pk': 'tenant2',
                'sk': str(uuid4())
            }
        )
    except Exception as e:
        print('GOOD!')
        pass
    
    # Query an index, which should only return items with my tenant ID
    print('Querying TimeSeriesIndex with my ID')
    res = table.query(
        KeyConditionExpression=Key('pk').eq(my_tenant),
        IndexName='TimeSeriesIndex'
    )
    
    for item in res['Items']:
        assert item['pk'] == my_tenant
    
    # Query an index with someone else's tenant ID
    print('Querying TimeSeriesIndex with someone else\'s ID')
    try:
        res = table.query(
            KeyConditionExpression=Key('pk').eq('tenant2'),
            IndexName='TimeSeriesIndex'
        )
    except Exception as e:
        print('GOOD!')
        pass

    print('If we made it here, everything is working as expected! :)')


def create_temp_tenant_session(access_role_arn: str, session_name: str, tenant_id: str, duration_sec: int):
    '''
    Assumes the access role and injects tenant ID via tagging

    Parametrs:
        access_role_arn (str): The ARN of the access role to assume
        session_name (str): The desired name of the temporary session
        tenant_id (str): The tenant ID to inject to which permissions will be scoped
        duration_sec (int): The number of seconds the session should be valid for

    Returns: 
        session (boto3.Session): Session instantiated with scoped credentials
    '''
    sts = boto3.client('sts')
    assume_role_response = sts.assume_role(
        RoleArn=access_role_arn,
        DurationSeconds=duration_sec,
        RoleSessionName=session_name,
        Tags=[
            {
                'Key': 'TenantID',
                'Value': tenant_id
            }
        ]
    )
    session = boto3.Session(
        aws_access_key_id=assume_role_response['Credentials']['AccessKeyId'],
        aws_secret_access_key=assume_role_response['Credentials']['SecretAccessKey'],
        aws_session_token=assume_role_response['Credentials']['SessionToken']
    )
    return session
