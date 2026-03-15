import React from "react";
import { ButtonGroup, Button } from "@mui/material";


interface Props {
  orderType: string;
  onChange: (type: string) => void;
  types?: string[];
}

const DEFAULT_TYPES = ["DineIn", "Delivery", "PickUp"];

const OrderTypeSelector: React.FC<Props> = ({
  orderType,
  onChange,
  types = DEFAULT_TYPES,
}) => (
  <ButtonGroup fullWidth>
    {types.map((type) => (
      <Button
        key={type}
        variant={orderType === type ? "contained" : "outlined"}
        onClick={() => onChange(type)}
      >
        {type}
      </Button>
    ))}
  </ButtonGroup>
);

export default OrderTypeSelector;
