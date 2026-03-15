import React from "react";
import { Button } from "@mui/material";

interface Props {
  onCheckout: () => void;
  paymentLoading: boolean //zodu-hotfix-01
}

const PaidButton: React.FC<Props> = ({ onCheckout, paymentLoading }) => (
  <Button
    fullWidth
    variant="contained"
    color="success"
    size="large"
    disabled={paymentLoading} //zodu-hotfix-01
    onClick={onCheckout}
  >
    Paid
  </Button>
);

export default PaidButton;
