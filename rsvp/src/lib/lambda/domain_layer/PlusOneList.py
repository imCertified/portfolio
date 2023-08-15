from typing import List
from PlusOne import PlusOne


class PlusOneList:
    def __init__(self, allowed_plus_ones: int) -> None:
        print('Creating PlusOneList object')
        self.__plus_ones = []
        self.allowed_plus_ones = allowed_plus_ones
    
    def add_plus_one(self, plus_one: PlusOne):
        if type(plus_one) != PlusOne:
            plus_one = PlusOne(plus_one)
        
        self.__plus_ones.append(plus_one)

        # Always limit list of plus ones to the total number allowed by the invite
        self.__plus_ones = self.__plus_ones[:self.allowed_plus_ones]

        return

    def as_ddb(self):
        return [plus_one.as_ddb() for plus_one in self.__plus_ones]

    def sanitized(self):
        return [plus_one.sanitized() for plus_one in self.__plus_ones]