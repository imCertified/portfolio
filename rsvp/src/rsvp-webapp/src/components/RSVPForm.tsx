import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner, VStack, Text, Button, IconButton } from "@chakra-ui/react";
import InviteeForm from "./InviteeForm";
import { Invite, Invitee } from "../services/inviteService";
import PlusOneForm from "./PlusOneForm";
import { BsPlusLg } from 'react-icons/bs'

const API_DOMAIN = import.meta.env.VITE_API_DOMAIN; // Pull API location from dotenv config file

// Method to decipher whether update is to plusOne or invitee in handle methods
enum UpdateType {
  Invitee,
  PlusOne,
}

const RSVPForm = () => {
  const { inviteId } = useParams();
  const [invite, setInvite] = useState<Invite>({
    invitees: [
      {
        name: "",
        attending: false,
        foodSelection: "",
        dietaryRestrictions: "",
      },
    ],
    plusOnes: [
      {
        name: "",
        foodSelection: "",
        dietaryRestrictions: "",
        ageGroup: "",
      }
    ],
    allowedPlusOnes: 0
  });
  const [isSubmitted, setSubmitted] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setLoading] = useState(false);

  // Fetch the invite on first page load
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_DOMAIN}/invite/${inviteId}`).then((response) => {
      setLoading(false);
      setInvite(response.data);
    });
  }, []);

  const handleFoodSelectionUpdate = (
    type: UpdateType,
    updateIndex: number,
    foodSelection: string
  ) => {
    let newInvite = {
      ...invite,
    };

    // Update Invitee food selection
    if (type === UpdateType.Invitee) {
      newInvite.invitees = newInvite.invitees.map((invitee, index) => {
        return {
          ...invitee,
          foodSelection:
            index === updateIndex ? foodSelection : invitee.foodSelection,
        };
      });
    } else if (type === UpdateType.PlusOne) {
      newInvite.plusOnes = newInvite.plusOnes.map((plusOne, index) => {
        return {
          ...plusOne,
          foodSelection:
            index === updateIndex ? foodSelection : plusOne.foodSelection,
        };
      });
    }

    setInvite(newInvite);
  };

  const handleDietaryRestrictionsUpdate = (
    type: UpdateType,
    updateIndex: number,
    dietaryRestrictions: string
  ) => {
    let newInvite = {
      ...invite,
    };

    // Update Invitee food selection
    if (type === UpdateType.Invitee) {
      newInvite.invitees = newInvite.invitees.map((invitee, index) => {
        return {
          ...invitee,
          dietaryRestrictions: index === updateIndex ? dietaryRestrictions : invitee.dietaryRestrictions
        };
      });
    } else if (type === UpdateType.PlusOne) {
      newInvite.plusOnes = newInvite.plusOnes.map((plusOne, index) => {
        return {
          ...plusOne,
          dietaryRestrictions: index === updateIndex ? dietaryRestrictions : plusOne.dietaryRestrictions
        };
      });
    }

    setInvite(newInvite);
  };

  const handleAttendingChange = (updateIndex:number, attending: boolean) => {
    let newInvite = {
      ...invite
    }

    newInvite.invitees = newInvite.invitees.map((invitee, index) => {
      return {
        ...invitee,
        attending: index === updateIndex ? attending : invitee.attending
      };
    });

    setInvite(newInvite);
  }

  const handleNameChange = (updateIndex: number, name: string) => {
    let newInvite = {
      ...invite
    }

    newInvite.plusOnes = newInvite.plusOnes.map((plusOne, index) => {
      return {
        ...plusOne,
        name: index === updateIndex ? name : plusOne.name
      };
    });

    setInvite(newInvite);
  }

  const handleAgeGroupChange = (updateIndex: number, ageGroup: string) => {
    let newInvite = {
      ...invite
    }

    newInvite.plusOnes = newInvite.plusOnes.map((plusOne, index) => {
      return {
        ...plusOne,
        ageGroup: index === updateIndex ? ageGroup : plusOne.ageGroup,
        foodSelection: index === updateIndex ? ageGroup === 'child' ? 'Kid\'s Meal' : plusOne.foodSelection : plusOne.foodSelection
      };
    });

    setInvite(newInvite);
  }

  const handleAddPlusOne = () => {
    let newInvite = {
      ...invite
    }
    
    newInvite.plusOnes.push({
      name: '',
      ageGroup: 'child',
      dietaryRestrictions: '',
      foodSelection: 'Kid\'s Meal'
    })

    newInvite.plusOnes = newInvite.plusOnes.slice(0, invite.allowedPlusOnes)

    setInvite(newInvite);
  }

  const handleDeletePlusOne = (index: number) => {
    let newInvite = {
      ...invite
    }

    delete newInvite.plusOnes[index];

    // Remove null references as a result of deleting plus Ones
    newInvite.plusOnes = newInvite.plusOnes.filter(plusOne => {
      return plusOne != null
    })

    setInvite(newInvite);
  }

  const handleSubmit = () => {
    console.log('Submitting');

    const intermedInvite = {
      ...invite
    }

    // Remove null references as a result of deleting plus Ones
    intermedInvite.plusOnes = intermedInvite.plusOnes.filter(plusOne => {
      return plusOne != null
    })

    const payload = JSON.stringify(intermedInvite);

    setSubmitting(true);
    fetch(`https://api.rsvp.portfolio.mannyserrano.com/invite/${inviteId}`, {
      method: "PUT",
      body: payload,
    }).then((response) => {
      if (response.status === 200) {
        setSubmitting(false);
        setSubmitted(true);
      }
      return response.json();
    });
  }

  const atLeastOneAttending = (invitees: Invitee[]) => {
    return invitees.some((invitee) => {
      return invitee.attending === true
    })
  }

  // Return a basic spinner if still loading
  if (isLoading) {
    return <Spinner size="md" />;
  }

  // Return thank you message if done submitting
  if (isSubmitted) {
    return <Text>Your RSVP has been received. Thank you!</Text>;
  }

  return (
    <>
      <VStack spacing={8}>
        {invite.invitees.map((invitee, index) => {
          return (
            <InviteeForm
              invitee={invitee}
              onFoodSelectionUpdate={(foodSelection: string) =>
                handleFoodSelectionUpdate(
                  UpdateType.Invitee,
                  index,
                  foodSelection
                )
              }
              onDietaryRestrictionsChange={(dietaryRestrictions: string) => 
                handleDietaryRestrictionsUpdate(
                  UpdateType.Invitee,
                  index,
                  dietaryRestrictions
                )
              }
              onAttendingChange={(attending: boolean) => 
                handleAttendingChange(
                  index,
                  attending
                )
              }
              key={index}
            />
          );
        })}
        {/* Don't show plus ones if none of the attendees are attending */}
        {atLeastOneAttending(invite.invitees) && invite.plusOnes.map((plusOne, index) => {
          return (
            <PlusOneForm
              plusOne={plusOne}
              onFoodSelectionChange={(foodSelection: string) =>
                handleFoodSelectionUpdate(
                  UpdateType.PlusOne,
                  index,
                  foodSelection
                )
              }
              onDietaryRestrictionsChange={(dietaryRestrictions: string) => 
                handleDietaryRestrictionsUpdate(
                  UpdateType.PlusOne,
                  index,
                  dietaryRestrictions
                )
              }
              onNameChange={(name: string) => 
                handleNameChange(index, name)
              }
              onAgeGroupChange={(ageGroup: string) =>
                handleAgeGroupChange(index, ageGroup)           
              }
              onDelete={() => handleDeletePlusOne(index)}
              key={index}
            />
          );
        })}
        {invite.plusOnes.length < invite.allowedPlusOnes && <IconButton aria-label="Add Plus One" icon={<BsPlusLg />} onClick={handleAddPlusOne} />}
        <Button onClick={handleSubmit} isLoading={isSubmitting}>Submit</Button>
      </VStack>
    </>
  );
};

export default RSVPForm;
