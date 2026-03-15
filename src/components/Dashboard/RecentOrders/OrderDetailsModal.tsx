// components/dashboard/RecentOrders/OrderDetailsModal.tsx
import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OrderDetailsSummary from "./OrderDetailsSummary";

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  open,
  onClose,
  order,
}) => {
  if (!order) return null;

  const {subtotal,total_amt,discount_value,discount_type,total_tax} = order;
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "dine-in":
        return "primary";
      case "takeaway":
        return "secondary";
      case "delivery":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 800,
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",

            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "background.paper",
          }}
        >
          {/* Left: Order meta info */}
          <Box display="flex" flexWrap="wrap" gap={3} alignItems="flex-end">
            <Box id="modal-modal-title">
              <Typography variant="h6" fontWeight="bold">
                Order Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                #{order.public_order_no || order.id}
              </Typography>
            </Box>
            {/* Order Type */}
            <Chip
              label={order.order_type || order.type || "Unknown"}
              size="small"
              color={getTypeColor(order.order_type || order.type) as any}
            />

            {/* Date & Time */}
            <Typography variant="body2" fontWeight="medium">
              {order.formatted_date }
            </Typography>

            {/* Items Count */}
            <Typography variant="body2" fontWeight="medium">
              {order.items?.length || 0} items
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Order Summary */}
          {/* <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Order Summary
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Order Type
                </Typography>
                <Chip
                  label={order.order_type || order.type || "Unknown"}
                  size="small"
                  color={getTypeColor(order.order_type || order.type) as any}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              {order.status && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={order.status}
                    size="small"
                    color={getStatusColor(order.status) as any}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(order.order_date || order.date)}
                </Typography>
              </Box>

              {order.customer_name && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.customer_name}
                  </Typography>
                  {order.customer_phone && (
                    <Typography variant="body2" color="text.secondary">
                      {order.customer_phone}
                    </Typography>
                  )}
                </Box>
              )}

              {order.payment_method && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.payment_method}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper> */}

          {/* Order Items */}
          <Paper sx={{ p: 2,mb:0.5}}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Order Items
            </Typography>
            <TableContainer sx={{
    maxHeight: 300,        // 👈 fixed height (adjust as needed)
    overflowY: "auto",
  }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Item</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Price</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.item_name || item.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>{item.quantity || item.qty} {item.unit}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ whiteSpace: "nowrap" }}> 
                            ₹ {item.price?.toLocaleString("en-IN")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography   sx={{ whiteSpace: "nowrap" }}
 fontWeight="bold">
                            ₹ {item.amount?.toLocaleString("en-IN")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography  color="text.secondary">
                          No item details available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Order Total */}
          <Paper sx={{ p: 1 }}>
            <OrderDetailsSummary
              subtal={Number(subtotal) || 0}
              tax={Number(total_tax) || 0}
              total={Number(total_amt) || 0}
              discountType={discount_type}
              discountValue={Number(discount_value)||0}
            />
          </Paper>
        </Box>
      </Box>
    </Modal>
  );
};

export default OrderDetailsModal;