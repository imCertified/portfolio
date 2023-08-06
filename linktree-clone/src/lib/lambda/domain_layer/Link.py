from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr
from ulid import ULID

    

class Link:
    '''
    This class represents a Link object in this domain
    '''
    def __init__(self, link_id: str, username: str, url: str, display_text: str, is_explicit: bool):
        self.link_id = link_id
        self.username = username.lower()
        self.url = url
        self.display_text = display_text
        self.is_explicit = is_explicit
    
    @classmethod
    def new(cls, username: str, url: str, display_text: str, is_explicit: bool):
        '''
        Creates new Link object 

        Parameters:
            username (str): The friendly name (ID) of the tree to which this link should belong
            url (str): The URL that should be linked
            display_text (str): The text to be displayed for this Link
            is_explicit (bool): Flag to mark link as explicit
        
        Returns:
            link (Link): The newly-created lin object
        '''
        print('Creating new Link object')
        link_id = str(ULID())
        return cls(
            link_id=link_id,
            username=username,
            url=url,
            display_text=display_text,
            is_explicit=is_explicit
        )

    @classmethod
    def from_ddb_rep(cls, rep: dict):
        '''
        Marshalls a Link object from the DDB representation of that Link

        Parameters:
            rep (dict): The DDB representation of the object
        '''

        print('Marshalling Link from DDB rep')

        return cls(
            username=rep['pk'],
            link_id=rep['sk'].replace('LINK#', ''),
            url=rep['url'],
            display_text=rep['display_text'],
            is_explicit=rep['is_explicit']
        )

    @classmethod
    def delete_in_table(cls, table, link_id: str, user: str):
        '''
        Deletes a Link in a given table.

        Parameters:
            table: The DDB table from which to delete the Link
            link_id (str): The ID of the Link to delete in the table
            user (str): The supposed owner of the Link
        '''
        print(f'Deleting username {user}\'s link {link_id}')
        try:
            table.delete_item(
                Key={
                    'pk': user.lower(),
                    'sk': f'LINK#{link_id}'
                }
            )
        except ClientError as e:
            print('Got client error that we\'re going to ignore')
            print(e)
            # If conditional check fails, we don't really care. Either they don't own it or it doesn't exist
            pass

    def create_in_table(self, table):
        '''
        Creates a Link in the given table. Raises UnownedTreeException if Tree is not owned

        Parameters:
            table: The boto3 DynamoDB Table object
        '''

        table.put_item(
            Item={
                **self.get_key(),
                'url': self.url,
                'display_text': self.display_text,
                'is_explicit': self.is_explicit
            }
        )

    def get_key(self):
        return {
            'pk': self.username,
            'sk': f'LINK#{self.link_id}'
        }
    
    def sanitized(self):
        return {  # Do not return URL so that it can be harvested
            'linkId': self.link_id,
            'displayText': self.display_text,
            'isExplicit': self.is_explicit,
            'url': self.url
        }