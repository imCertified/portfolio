import boto3
import datetime

session = boto3.Session(profile_name='portfolio', region_name='us-east-1')
ddb = session.resource('dynamodb')
table = ddb.Table('AssumptionTable')


for tenant in ['tenant1', 'tenant2']:
    print(f'Adding items for {tenant}')
    
    for sk in ['tenantsk1', 'tenantsk2', 'tenantsk3']:  # Add the same SK for each tenant to ensure that the index (which flipflips the pk and sk) and scans still adhere to the scoping rules
        table.put_item(
            Item={
                'pk': tenant,
                'sk': sk,
                'timestamp': datetime.datetime.now().isoformat()
            }
        )