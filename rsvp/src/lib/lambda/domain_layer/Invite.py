from boto3.dynamodb.conditions import Key
from typing import List
from botocore.exceptions import ClientError
from InviteeList import InviteeList
from Invitee import Invitee
from PlusOneList import PlusOneList
from PlusOne import PlusOne


class Invite:
    def __init__(self, invite_id: str, allowed_plus_ones: int, responded: int, invitees: InviteeList, plus_ones: PlusOneList = None) -> None:
        print('Creating invite object')
        self.invite_id = invite_id
        self.allowed_plus_ones = allowed_plus_ones
        self.responded = responded
        self.invitees = invitees
        self.plus_ones = plus_ones

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

        # Build invitee list
        invitee_list = InviteeList()
        for invitee in rep['invitees']:
            invitee_list.add_invitee(Invitee.from_ddb(invitee))

        # Build plus one list
        plus_one_list = PlusOneList(int(rep['allowed_plus_ones']))
        for plus_one in rep['plus_ones']:
            plus_one_list.add_plus_one(PlusOne.from_ddb(plus_one))
        
        return cls(
            invite_id=rep['pk'],
            allowed_plus_ones=int(rep['allowed_plus_ones']),
            responded=rep['responded'],
            invitees=invitee_list,
            plus_ones=plus_one_list            
        )

    @classmethod
    def get_from_invite_id(cls, table, invite_id: str):
        '''
        Responsible for retrieving a single invite given its invite ID from the given table

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
            raise ValueError(f'Invite with ID {invite_id} does not exist in given table')

        return cls.from_ddb(res['Item'])  # Double classmethod :D

    @classmethod
    def respond(cls, table, invite_id: str, invite_rep: dict):
        '''
        Responsible for responding to an invite

        Parameters:
            table: The DynamoDB Table object from which to pull the invite
            invite (dict): Invite from React
        '''

        # Get the existing invite from DDB
        invite = cls.get_from_invite_id(table, invite_id)

        # Ensure that the user did not add any invitees by reconciling(this could not happen normally, but still worth checking)
        new_invitees = [Invitee.from_react_rep(invitee) for invitee in invite_rep['invitees']]
        invite.invitees.reconcile_invitees(new_invitees)

        # Override existing plus ones as we don't need the same kinds of checks
        plus_ones_list = PlusOneList(invite.allowed_plus_ones)
        # You can't bring plus ones if you're not coming!
        if invite.invitees.at_least_one_attending():
            for plus_one in invite_rep['plusOnes']:
                plus_ones_list.add_plus_one(PlusOne.from_react_rep(plus_one))
        invite.plus_ones = plus_ones_list

        invite.responded = True

        invite.update_in_table(table)

    def create_in_table(self, table):
        '''
        Creates the Invite in the given table
        '''
        table.put_item(
            Item=self.as_ddb()
        )
    
    def update_in_table(self, table):
        # Simply procies out to create
        self.create_in_table(table)

    def as_ddb(self):
        '''
        Returns an object as its DynamoDB representation

        Returns:
            rep (dict): The DynamoDB representation
        '''
        return {
            **self.get_key(),
            'invitees': self.invitees.as_ddb(),
            'plus_ones': self.plus_ones.as_ddb(),
            'responded': self.responded,
            'allowed_plus_ones': self.allowed_plus_ones
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
            'invitees': self.invitees.sanitized(),
            'plusOnes': self.plus_ones.sanitized(),
            'allowedPlusOnes': self.allowed_plus_ones
        }
