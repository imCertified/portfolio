from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError


class PlusOne:
    def __init__(self, name: str, age_group: str, food_selection: str, dietary_restrictions: str = None) -> None:
        print('Creating PlusOne object')
        self.name = name
        self.age_group = age_group
        self.dietary_restrictions = dietary_restrictions

        # Children only get kid's meals
        if age_group == 'child':
            self.food_selection = 'Kid\'s Meal'
        else:
            self.food_selection = food_selection

    @classmethod
    def from_ddb(cls, rep: dict):
        '''
        Responsible for marshalling a PlusOne object from its DDB representation

        Parameters:
            rep (dict): The raw representation of a PlusOne object from DDB
        
        Returns:
            plus_one (PlusOne): The PlusOne object
        '''
        print('Marshalling PlusOne from DDB rep')

        return cls(
            name=rep['name'],
            age_group=rep['age_group'],
            food_selection=rep['food_selection'],
            dietary_restrictions=rep['dietary_restrictions']
        )

    @classmethod
    def from_react_rep(cls, rep: dict):
        return cls(
            name=rep['name'],
            age_group=rep['ageGroup'],
            food_selection=rep['foodSelection'],
            dietary_restrictions=rep['dietaryRestrictions']
        )

    def as_ddb(self):
        '''
        Returns an PlusOne as its DynamoDB representation

        Returns:
            rep (dict): The DynamoDB representation of the PlusOne
        '''

        return {
            'name': self.name,
            'age_group': self.age_group,
            'food_selection': self.food_selection,
            'dietary_restrictions': self.dietary_restrictions
        }
    
    def sanitized(self):
        '''
        Returns a sanitized view of the PlusOne for returning to users

        Returns:
            sanitized_view (dict): The sanitized view
        '''
        return {
            'name': self.name,
            'foodSelection': self.food_selection,
            'ageGroup': self.age_group,
            'dietaryRestrictions': self.dietary_restrictions
        }
