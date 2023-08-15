import { Select } from "@chakra-ui/react";

interface foodSelectionProps {
    foodSelection: string;
    onFoodSelectionChange: (foodSelection: string) => void;
    disabled?: boolean;
}

const FoodSelection = ({ foodSelection, onFoodSelectionChange, disabled }: foodSelectionProps) => {
  return (
    <Select
      value={foodSelection}
      size="sm"
      onChange={(e) => onFoodSelectionChange(e.target.value)}
      disabled={disabled}
    >
      <option value="Pigeon Pie">Pigeon Pie</option>
      <option value="Meat Stew">Meat Stew</option>
      <option value="Lemon Cake">Lemon Cake</option>
      <option value="Direwolf Bread">Direwolf Bread</option>
      <option value="Kid's Meal">Kid's Meal</option>
    </Select>
  );
};

export default FoodSelection;
