from faker import Faker
from faker.providers import DynamicProvider
from ulid import ULID
from random import randint, choice
import boto3


session = boto3.Session(profile_name='portfolio', region_name='us-east-1')
ddb = session.resource('dynamodb')
table = ddb.Table('RSVPTable')

fake = Faker()
age_group_provider = DynamicProvider(
    provider_name='age_group',
    elements=['child', 'adult-nd', 'adult']
)
food_options_provider = DynamicProvider(
    provider_name='food_option',
    elements=['Pigeon Pie', 'Meat Stew', 'Lemon Cake', 'Direwolf Bread']
)
dietary_restrictions_provider = DynamicProvider(
    provider_name='dietary_restriction',
    elements=['Dairy', 'None', 'Celiac', 'N/A', '']
)
fake.add_provider(age_group_provider)
fake.add_provider(food_options_provider)
fake.add_provider(dietary_restrictions_provider)

def empty_table():
    res = table.scan()

    for item in res['Items']:
        table.delete_item(
            Key={
                'pk': item['pk']
            }

        )

if input('Empty table first? (Y/n)\n').lower() != 'n':
    empty_table()

# Create 50 unique invites
for x in range(0, 50):
    print('Creating new Invite')
    invite_id = str(ULID())
    print(f'Invite ID: {invite_id}')
    invitees = []
    plus_ones = []
    
    # Create between 1 and 3 random invitees
    for x in range(0, randint(1, 3)):

        invitees.append({
            'name': fake.name(),
            'attending': choice([True, False]),
            'food_selection': fake.food_option(),
            'dietary_restrictions': fake.dietary_restriction()
        })

    # Create between 0 and 2 random plus ones
    for x in range (0, randint(0, 2)):
        age_group = fake.age_group()

        # Make sure children get kid's meals
        if age_group == 'child':
            food_selection = 'Kid\'s Meal'
        else:
            food_selection = fake.food_option()

        plus_ones.append({
            'name': fake.name(),
            'age_group': age_group,  # random age group
            'food_selection': food_selection,
            'dietary_restrictions': fake.dietary_restriction()
        })

    # Create Invite in table
    table.put_item(
        Item={
            'pk': invite_id,
            'responded': False,
            'invitees': invitees,
            'plus_ones': plus_ones,
            'allowed_plus_ones': len(plus_ones)
        }
    )