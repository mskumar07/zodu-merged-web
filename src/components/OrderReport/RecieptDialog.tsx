import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Item {
  id: number;
  name: string;
  quantity: number;
  amount: number;
}

interface ReceiptProps {
  orderId: string;
  dineType: string;
  date: string;
  totalItems: number;
  gst: number;
  totalAmount: number;
  paymentType: string;
  items: Item[];
  onClose: () => void;
}

const ReceiptCard: React.FC<ReceiptProps> = ({
  orderId,
  dineType,
  date,
  totalItems,
  gst,
  totalAmount,
  paymentType,
  items,
  onClose,
}) => {
  return (
    <Box sx={{ p: 2, width: 400 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography color="error" fontWeight="bold">
          #{orderId}
        </Typography>
        <Typography variant="body2">{dineType}</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {/* Order Details */}
      <Box mt={2}>
        {/* Date */}
        <Box display="flex" mb={1}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, minWidth: 120, maxWidth: 120 }}
          >
            Date:
          </Typography>
          <Typography variant="body2">{date}</Typography>
        </Box>

        {/* Total Items */}
        <Box display="flex" mb={1}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, minWidth: 120, maxWidth: 120 }}
          >
            Total Items:
          </Typography>
          <Typography variant="body2">{totalItems} Items</Typography>
        </Box>

        {/* GST */}
        <Box display="flex" mb={1}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, minWidth: 120, maxWidth: 120 }}
          >
            GST %:
          </Typography>
          <Typography variant="body2">{gst}%</Typography>
        </Box>

        {/* Total Amount */}
        <Box display="flex" mb={1}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, minWidth: 120, maxWidth: 120 }}
          >
            Total Amount:
          </Typography>
          <Typography variant="body2">Rs. {totalAmount.toFixed(2)}</Typography>
        </Box>

        {/* Payment Type */}
        <Box display="flex" mb={1}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, minWidth: 120, maxWidth: 120 }}
          >
            Payment Type:
          </Typography>
          <Typography variant="body2">{paymentType}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Items Table */}
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "grey.200" }}>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              S. No
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Amount
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              sx={{
                bgcolor: index % 2 === 0 ? "grey.50" : "white", // alternate row colors
              }}
            >
              <TableCell align="center">{index + 1}</TableCell>
              <TableCell>
                {item.name} * {item.quantity}
              </TableCell>
              <TableCell align="right">RM {item.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>  
    </Box>
  );
};

export default function ReceiptDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const sampleItems: Item[] = [
    { id: 1, name: "Pani poori", quantity: 2, amount: 200 },
    { id: 2, name: "Sandwich", quantity: 3, amount: 50 },
    { id: 3, name: "Burger", quantity: 1, amount: 87 },
  ];

  return (
    <Box textAlign="center" mt={5}>
      {/* Dialog Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        sx={{ diplay: "flex", justifyContent: "center" }}
      >
        <DialogContent sx={{ p: 0, width: 400 }}>
          <ReceiptCard
            orderId="37462397"
            dineType="Dine In"
            date="24-04-2023"
            totalItems={5}
            gst={12}
            totalAmount={8000}
            paymentType="Credit Card"
            items={sampleItems}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
