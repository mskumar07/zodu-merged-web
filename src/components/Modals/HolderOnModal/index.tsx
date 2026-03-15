import { Box, Typography } from "@mui/material";
import React from "react";
import type { Order } from "../../../types/order.ts";

interface Props {
  open: boolean;
  order: Order;
  onClose: () => void;
  onResume: () => void;
}

const HoldOrderModal: React.FC<Props> = ({
  open,
  order,
  onClose,
  onResume,
}) => {
  return (
    <Box
      sx={{
        zIndex: 1000,
        backgroundColor: "white",
        borderRadius: 2,
        border: "1px solid black",
        maxHeight: "50px",
      }}
    >
      <Typography>You order in Hold</Typography>
    </Box>
  );
};

export default HoldOrderModal;
