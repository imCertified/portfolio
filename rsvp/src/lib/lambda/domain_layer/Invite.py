from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, ListAttribute, BooleanAttribute, NumberAttribute
from Invitee import InviteeAttribute
from PlusOne import PlusOneAttribute


class InviteModel(Model):
    class Meta:
        table_name='RSVPTable'
        region='us-east-1'

    invite_id = UnicodeAttribute(hash_key=True, attr_name='pk')
    allowed_plus_ones = NumberAttribute()
    responded = BooleanAttribute()
    invitees = ListAttribute(of=InviteeAttribute)
    plus_ones = ListAttribute(of=PlusOneAttribute)

    def sanitized(self):
        '''
        Returns a sanitized view of the Invite for returning to users

        Returns:
            sanitized_view (dict): The sanitized view
        '''

        return {
            'inviteId': self.invite_id,
            'invitees': [invitee.sanitized() for invitee in self.invitees],
            'plusOnes': [plus_one.sanitized() for plus_one in self.plus_ones],
            'allowedPlusOnes': self.allowed_plus_ones
        }
    
    def at_least_one_attending(self):
        return any([invitee.attending for invitee in self.invitees])