import {
  Container,
  HStack,
  Input,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { Invitee } from "../services/inviteService";
import FoodSelection from "./FoodSelection";

interface InviteeFormProps {
  invitee: Invitee;
  onAttendingChange: (attending: boolean) => void;
  onFoodSelectionUpdate: (foodSelection: string) => void;
  onDietaryRestrictionsChange: (dietaryRestrictions: string) => void;
}

const InviteeForm = ({
  invitee,
  onAttendingChange,
  onFoodSelectionUpdate,
  onDietaryRestrictionsChange,
}: InviteeFormProps) => {
  const attendingValue = invitee.attending === true ? "true" : "false";

  return (
    <>
      <Container w='100vw'>
        {invitee.name}
        <RadioGroup
          onChange={(e) => onAttendingChange(e === "true" ? true : false)}
          value={attendingValue}
        >
          <HStack spacing={10}>
            <Radio value="false">Not Attending</Radio>
            <Radio value="true">Attending</Radio>
          </HStack>
        </RadioGroup>
        <FoodSelection
          foodSelection={invitee.foodSelection}
          onFoodSelectionChange={onFoodSelectionUpdate}
        ></FoodSelection>
        <Input
          size="sm"
          value={invitee.dietaryRestrictions}
          placeholder="Dietary Restrictions"
          onChange={(e) => onDietaryRestrictionsChange(e.target.value)}
        ></Input>
      </Container>
    </>
  );
};

export default InviteeForm;
