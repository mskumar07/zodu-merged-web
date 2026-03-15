import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Person2Rounded, PersonOffOutlined } from "@mui/icons-material";

interface Props {
  orderId: string;
  tableName: number | null;
}

const OrderInfoSection: React.FC<Props> = ({ orderId, tableName }) => (
  <Box>
    {/* <Typography variant="subtitle2" color="text.secondary">
      Order ID: #{orderId}
    </Typography> */}
    <Typography variant="subtitle2" color="text.secondary">
      Table / Customer: Table {tableName}
    </Typography>
  </Box>
);

export default OrderInfoSection;
