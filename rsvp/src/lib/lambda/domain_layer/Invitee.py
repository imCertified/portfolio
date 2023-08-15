from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError


class Invitee:
    def __init__(self, name: str, attending: bool = None, dietary_restrictions: str = None, food_selection: str = None) -> None:
        print('Creating Invitee object')
        self.name = name
        self.attending = attending
        self.food_selection = food_selection
        self.dietary_restrictions = dietary_restrictions

    @classmethod
    def from_ddb(cls, rep: dict):
        '''
        Responsible for marshalling an Invitee object from its DDB representation

        Parameters:
            rep (dict): The raw representation of an Invitee object from DDB
        
        Returns:
            invitee (Invitee): The Invitee object
        '''

        print('Marshalling Invitee from DDB rep')
        args = {
            'name': rep['name'],
        }

        # Marshal optional attributes
        try:
            args['attending'] = rep['attending']
        except KeyError:
            pass
        
        try:
            args['food_selection'] = rep['food_selection']
        except KeyError:
            pass

        try:
            args['dietary_restrictions'] = rep['dietary_restrictions']
        except KeyError:
            pass

        return cls(
            **args
        )
    
    @classmethod
    def from_react_rep(cls, rep: dict):
        # This basically just has to map from camelCase "python case"
        return cls(
            name=rep['name'],
            attending=rep['attending'],
            food_selection=rep['foodSelection'],
            dietary_restrictions=rep['dietaryRestrictions']
        )

    def as_ddb(self):
        '''
        Returns an Invitee as its DynamoDB representation

        Returns:
            rep (dict): The DynamoDB representation of the Invitee
        '''

        return {
            'name': self.name,
            'attending': self.attending,
            'food_selection': self.food_selection,
            'dietary_restrictions': self.dietary_restrictions
        }

    def __eq__(self, obj) -> bool:
        return self.name == obj.name
        
    
    def sanitized(self):
        '''
        Returns a sanitized view of the Invitee for returning to users

        Returns:
            sanitized_view (dict): The sanitized view
        '''
        return {
            'name': self.name,
            'attending': self.attending,
            'foodSelection': self.food_selection,
            'dietaryRestrictions': self.dietary_restrictions
        }