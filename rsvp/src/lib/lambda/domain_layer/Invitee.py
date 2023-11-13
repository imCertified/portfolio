from pynamodb.attributes import MapAttribute, UnicodeAttribute, BooleanAttribute


class InviteeAttribute(MapAttribute):
    name = UnicodeAttribute()
    attending = BooleanAttribute()
    food_selection = UnicodeAttribute()
    dietary_restrictions = UnicodeAttribute()

    def sanitized(self):
        return {
            'name': self.name,
            'attending': self.attending,
            'foodSelection': self.food_selection,
            'dietaryRestrictions': self.dietary_restrictions
        }
    