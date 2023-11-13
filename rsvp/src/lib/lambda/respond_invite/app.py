import json
from Invite import InviteModel
from PlusOne import PlusOneAttribute


def lambda_handler(event, context):
    print(json.dumps(event))

    body = json.loads(event['body'])
    invite_id = event['pathParameters']['inviteId']

    try:
        invite = InviteModel.get(hash_key=invite_id)
    except Exception as e:
        print(e)
        return {
            'statusCode': 404
        }

    # Reconcile existing invitees with those in the request
    # Ensures that new invitees cannot be introduced
    for invitee in body['invitees']:
        for existing_invitee in invite.invitees:
            if invitee['name'] == existing_invitee.name:
                existing_invitee.attending = invitee['attending']
                continue
    
    # Override existing plus ones as we don't need the same kinds of checks
    # Also translate from camelcase to pythonic
    # TODO: Use VTL to do this translation
    if invite.at_least_one_attending():
        invite.plus_ones = [
            PlusOneAttribute(
                name = plus_one['name'],
                age_group = plus_one['ageGroup'],
                dietary_restrictions = plus_one['dietaryRestrictions'],
                food_selection = plus_one['foodSelection']
            ) for plus_one in body['plusOnes']
        ]
    else:  # You can't bring plus ones if you're not coming!
        invite.plus_ones = []

    invite.responded = True

    invite.save()

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT'
        }
    }
