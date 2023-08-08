from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError


class Invite:
    def __init__(self, invite_id: str, invitee_name: str, attending: bool, plus_one: bool, allow_plus_one: bool) -> None:
        print('Creating invite object')
        self.invite_id = invite_id
        self.invitee_name = invitee_name
        self.attending = attending
        self.allow_plus_one = allow_plus_one

        # Don't allow someone to RSVP that they're not coming but they're also bringing a plus one
        if attending is True and allow_plus_one is True:
            self.plus_one = plus_one
        else:
            self.plus_one = False

    @classmethod
    def from_ddb(cls, rep: dict):
        '''
        Responsible for marshalling an Invite object from its DDB representation

        Parameters:
            rep (dict): The raw representation of an Invite object from DDB
        
        Returns:
            invite (Invite): The Invite object
        '''
        print('Marshalling from DDB rep')
        return cls(
            invite_id=rep['pk'],
            invitee_name=rep['invitee_name'],
            attending=rep['attending'],
            plus_one=rep['plus_one'],
            allow_plus_one=rep['allow_plus_one']
        )

    @classmethod
    def get_from_invite_id(cls, table, invite_id: str):
        '''
        Responsible for retrieving a single invite given its invite ID

        Parameters:
            table: The DynamoDB Table object from which to pull the invite
            invite_id (str): The invite ID to retrieve
        
        Returns:
            invite (Invite): The Invite object
        '''
        print('Getting invite from ID')
        res = table.get_item(
            Key={
                'pk': invite_id
            }
        )

        if 'Item' not in res.keys():
            raise ValueError(
                f'Invite with ID {invite_id} does not exist in given table')

        return cls.from_ddb(res['Item'])

    @classmethod
    def respond(cls, table, invite_id: str, attending: bool, plus_one: bool):
        '''
        Responsible for responding to an invite

        Parameters:
            table: The DynamoDB Table object from which to pull the invite
            invite_id (str): The invite ID to retrieve
            attending (bool): Whether the invitee is attending or not
            plus_one (bool): Whether the invitee has included a plus one in their RSVP
        '''
        print(f'Responding to invite {invite_id}')
        try:
            table.update_item(
                Key={
                    'pk': invite_id
                },
                UpdateExpression='set attending = :a, plus_one = :p, responded = :t',
                ExpressionAttributeValues={
                    ':a': attending,
                    ':p': plus_one if attending else False,  # Don't allow to invite a plus one if they're not attending
                    ':t': True,
                },
                ConditionExpression=Key('pk').eq(invite_id)  # Don't allow creation
            )
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                raise ValueError(
                    f'Invite with ID {invite_id} does not exist in given table')
            else:
                raise e

    def as_ddb(self):
        '''
        Returns an object as its DynamoDB representation

        Returns:
            rep (dict): The DynamoDB representation
        '''
        return {
            **self.get_key(),
            'invitee_name': self.invitee_name,
            'attending': self.attending,
            'plug_one': self.plus_one
        }

    def get_key(self):
        '''
        Returns the primary key structure of an Invite

        Returns:
            key (dict): The primary key structure
        '''
        return {
            'pk': self.invite_id
        }

    def sanitized(self):
        '''
        Returns a sanitized view of the Invite for returning to users

        Returns:
            sanitized_view (dict): The sanitized view
        '''
        return {
            'inviteId': self.invite_id,
            'inviteeName': self.invitee_name,
            'attending': self.attending,
            'plusOne': self.plus_one,
            'allowPlusOne': self.allow_plus_one
        }
