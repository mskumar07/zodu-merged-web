import React from "react";
import { ButtonGroup, Button } from "@mui/material";

interface Props {
  paymentMethod: string;
  onChange: (method: string) => void;
  methods?: string[];
}

const DEFAULT_METHODS = ["Card", "QR", "Cash"];

const PaymentMethodSelector: React.FC<Props> = ({
  paymentMethod,
  onChange,
  methods = DEFAULT_METHODS,
}) => (
  <ButtonGroup fullWidth>
    {methods.map((method) => (
      <Button
        key={method}
        variant={paymentMethod === method ? "contained" : "outlined"}
        onClick={() => onChange(method)}
      >
        {method}
      </Button>
    ))}
  </ButtonGroup>
);

export default PaymentMethodSelector;
