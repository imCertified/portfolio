from botocore.exceptions import ClientError
from ulid import ULID
from datetime import datetime
from boto3.dynamodb.conditions import Key

    

class Click:
    '''
    This class represents a Click object in this domain
    '''
    def __init__(self, click_id: str, username: str, link_id: str, click_time: str):
        self.click_id = click_id
        self.link_id = link_id
        self.username = username.lower()
        
        # Just in case I accidentally pass the datetime as a datetime object instead of ISO-8601 string
        self.click_time = click_time.isofromat() if type(click_time) == datetime else click_time        
    
    @classmethod
    def new(cls, username: str, link_id: str):
        '''
        Creates new Click object 

        Parameters:
            username (str): The username to which the link belongs
            link_id (str): The friendly name (ID) of the tree to which this link should belong
        '''
        print(f'Creating new click event for {username} and link ID {link_id}')
        click_time = datetime.now().isoformat()
        click_id = str(ULID())
        return cls(
            click_id=click_id,
            username=username,
            link_id=link_id,
            click_time=click_time
        )

    @classmethod
    def from_ddb_rep(cls, rep: dict):
        '''
        Marshalls a Click object from the DDB representation of that Link

        Parameters:
            rep (dict): The DDB representation of the object
        '''

        print('Marshalling Click from DDB rep')

        return cls(
            click_id=rep['sk'].replace('CLICK#', ''),
            link_id=rep['gsi1pk'].replace('LINK#', ''),
            username=rep['pk'],
            click_time=rep['click_time']
        )

    def create_in_table(self, table):
        '''
        Creates a Click in the given table.

        Parameters:
            table: The boto3 DynamoDB Table object
        '''

        try:
            table.put_item(
                Item={
                    **self.get_key(),
                    'click_time': self.click_time,
                    'gsi1pk': f'LINK#{self.link_id}'
                },
                # ConditionExpression=Key('pk').eq(self.username)  # Create only if that owner exists
            )
        except Exception as e:
            print('Got error that we\'re going to ignore')
            print(e)
            print({
                **self.get_key(),
                'click_time': self.click_time
            })
            pass

    def get_key(self):
        return {
            'pk': self.username,
            'sk': f'CLICK#{self.click_id}'
        }
    
    def sanitized(self):
        return {
            'clickId': self.click_id,
            'linkId': self.link_id,
            'clickTime': self.click_time
        }