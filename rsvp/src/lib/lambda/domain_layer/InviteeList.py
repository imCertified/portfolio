from typing import List
from Invitee import Invitee


class InviteeList:
    def __init__(self) -> None:
        print('Creating InviteeList object')
        self.__invitees = []
    
    def add_invitee(self, invitee: Invitee):
        # Marshal invitee into correct type if it's not already there
        if type(invitee) != Invitee:
            invitee = Invitee
        
        self.__invitees.append(invitee)

    def as_ddb(self):
        return [invitee.as_ddb() for invitee in self.__invitees]

    def at_least_one_attending(self) -> bool:
        '''
        Responsible for determining if at least 1 invitee is attending

        Returns:
            attending (bool): Whether at least one person is attending
        '''
        for invitee in self.__invitees:
            if invitee.attending is True:
                return True
        
        return False

    def reconcile_invitees(self, new_invitee_list: List[Invitee]):
        '''
        Responsible for reconciling a new set of invitees with an existing set. If an invitee in the new set does not exist in the existing set, it is discarded
        '''

        reconciled_invitees = []
        for existing_invitee in self.__invitees:
            reconciliation_found = False
            for proposed_invitee in new_invitee_list:
                if existing_invitee == proposed_invitee:  # Equality based on matching name
                    reconciled_invitees.append(proposed_invitee)
                    reconciliation_found = True
            if reconciliation_found is False:
                reconciled_invitees.append(existing_invitee)


        self.__invitees = reconciled_invitees

    def invitees(self):
        return self.__invitees
    
    def sanitized(self):
        return [invitee.sanitized() for invitee in self.__invitees]