import {
  Center,
  Container,
  Grid,
  GridItem,
  IconButton,
  Input,
  Select
} from "@chakra-ui/react";
import { PlusOne } from "../services/inviteService";
import FoodSelection from "./FoodSelection";
import {IoMdClose} from 'react-icons/io';

interface PlusOneFormProps {
  plusOne: PlusOne;
  onNameChange: (name: string) => void;
  onFoodSelectionChange: (foodSelection: string) => void;
  onDietaryRestrictionsChange: (dietaryRestrictions: string) => void;
  onAgeGroupChange: (ageGroup: string) => void;
  onDelete: () => void;
}

const PlusOneForm = ({
  plusOne,
  onNameChange,
  onFoodSelectionChange,
  onDietaryRestrictionsChange,
  onAgeGroupChange,
  onDelete
}: PlusOneFormProps) => {
  return (
    <>
      <Container w="500px">
        <Grid templateColumns="5fr 1fr">
          <GridItem>
            <Input
              size="sm"
              value={plusOne.name}
              placeholder="Name"
              onChange={(e) => onNameChange(e.target.value)}
            ></Input>
            <Select
              size="sm"
              onChange={(e) => onAgeGroupChange(e.target.value)}
            >
              <option value="child" selected={plusOne.ageGroup == "child"}>
                14 and Under
              </option>
              <option
                value="adult-ng"
                selected={plusOne.ageGroup == "adult-ng"}
              >
                14-20
              </option>
              <option value="adult" selected={plusOne.ageGroup == "adult"}>
                21 and Over
              </option>
            </Select>
            <FoodSelection
              foodSelection={plusOne.foodSelection}
              onFoodSelectionChange={onFoodSelectionChange}
              disabled={plusOne.ageGroup === "child" ? true : false}
            />
            <Input
              size="sm"
              value={plusOne.dietaryRestrictions}
              placeholder="Dietary Restrictions"
              onChange={(e) => onDietaryRestrictionsChange(e.target.value)}
            ></Input>
          </GridItem>
          <GridItem>
            <Center>
              <IconButton onClick={onDelete} size="sm" isRound={true} aria-label="Delete Plus One" icon={<IoMdClose />} />
            </Center>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default PlusOneForm;
