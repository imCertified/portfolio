// Is it wildly overcomplicated to have a Person and an Invitee and a PlusOne? Yes.
// Still fun.
export interface Person {
  name: string;
  foodSelection: string;
  dietaryRestrictions: string;
}

export interface Invitee extends Person{
  attending: boolean;
}

export interface PlusOne extends Person {
  ageGroup: string;
}

export interface Invite {
  invitees: Invitee[];
  plusOnes: PlusOne[];
  allowedPlusOnes: number;
}