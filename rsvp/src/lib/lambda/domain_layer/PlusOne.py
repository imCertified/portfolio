from pynamodb.attributes import MapAttribute, UnicodeAttribute


class PlusOneAttribute(MapAttribute):
    age_group = UnicodeAttribute()
    dietary_restrictions = UnicodeAttribute()
    food_selection = UnicodeAttribute()
    name = UnicodeAttribute()

    def sanitized(self):
        return {
            'name': self.name,
            'foodSelection': self.food_selection,
            'ageGroup': self.age_group,
            'dietaryRestrictions': self.dietary_restrictions
        }