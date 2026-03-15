// components/reports/ReportModal.tsx
import React from "react";
import {
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  type Order,
  type Expense,
  type Purchase,
  type Inventory,
  OrderType,
} from "./types/report.type";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  type: "order" | "expense" | "purchase" | "inventory";
  data: Order | Expense | Purchase | Inventory | null;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "90vw",
  maxHeight: "80vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
};

export const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  type,
  data,
}) => {
  if (!data) return null;

  const toNumber = (value: unknown, fallback = 0): number => {
    if (value === null || value === undefined || value === "") return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const formatINR = (value: unknown): string => {
    return `₹${toNumber(value).toFixed(2)}`;
  };

  const renderOrderDetails = (order: Order) => (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {order.orderId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.dateTime}
          </Typography>
        </Box>
        <Chip
          label={order.orderType}
          color={order.orderType === OrderType.DELIVERY ? "primary" : "default"}
          size="small"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Customer Name
          </Typography>
          <Typography variant="body1">{order.customerName}</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Phone
          </Typography>
          <Typography variant="body1">{order.customerPhone}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Address
          </Typography>
          <Typography variant="body1">{order.address}</Typography>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                <TableCell align="right">
                  ${(item.quantity * item.price).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right">
                <Typography fontWeight="bold">Subtotal</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight="bold">
                  ${(order.totalAmount - order.gst).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right">
                <Typography>GST (10%)</Typography>
              </TableCell>
              <TableCell align="right">${order.gst.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right">
                <Typography variant="h6">Total</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">
                  ${order.totalAmount.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        mt={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center">
        <Typography variant="subtitle2" color="text.secondary">
          Payment Method
        </Typography>
        <Chip label={order.paymentMethod} size="small" />
      </Box>
    </Box>
  );

  const renderExpenseDetails = (expense: Expense) => (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {expense.expenseId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expense.date}
          </Typography>
        </Box>
        <Chip
          label={expense.dueAmount > 0 ? "Partially Paid" : "Paid"}
          color={expense.dueAmount > 0 ? "warning" : "success"}
          size="small"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Category
          </Typography>
          <Typography variant="body1">{expense.category}</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Vendor
          </Typography>
          <Typography variant="body1">{expense.vendor}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1">{expense.description}</Typography>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography fontWeight="bold">Total Amount</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight="bold">
                  ${expense.totalAmount.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>Paid Amount</Typography>
              </TableCell>
              <TableCell align="right">
                ${expense.paidAmount.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography
                  color={expense.dueAmount > 0 ? "error" : "success.main"}>
                  Due Amount
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  color={expense.dueAmount > 0 ? "error" : "success.main"}>
                  ${expense.dueAmount.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderPurchaseDetails = (purchase: Purchase) => (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {purchase.purchaseId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {purchase.date}
          </Typography>
        </Box>
        <Chip
          label={purchase.status}
          color={purchase.status === "Delivered" ? "success" : "warning"}
          size="small"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Supplier
          </Typography>
          <Typography variant="body1">{purchase.supplier}</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Ingredient
          </Typography>
          <Typography variant="body1">{purchase.ingredient}</Typography>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>Quantity</Typography>
              </TableCell>
              <TableCell align="right">{purchase.quantity}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>Unit Price</Typography>
              </TableCell>
              <TableCell align="right">
                ${purchase.unitPrice.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography fontWeight="bold">Total Amount</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight="bold">
                  ${purchase.totalAmount.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>Paid Amount</Typography>
              </TableCell>
              <TableCell align="right">
                ${purchase.paidAmount.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography
                  color={purchase.dueAmount > 0 ? "error" : "success.main"}>
                  Due Amount
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  color={purchase.dueAmount > 0 ? "error" : "success.main"}>
                  ${purchase.dueAmount.toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderInventoryDetails = (inventory: Inventory) => {
    const inventoryData = inventory as unknown as Record<string, unknown>;

    console.log("test",inventoryData);
    const itemId =
      (inventoryData.itemId as string) || (inventoryData.item_id as string) || "-";
    const itemName =
      (inventoryData.itemName as string) ||
      (inventoryData.item_name as string) ||
      "-";
    const category =
      (inventoryData.category as string) ||
      (inventoryData.category_name as string) ||
      "-";
    const unit =
      (inventoryData.unit as string) || (inventoryData.unit_name as string) || "";
    const stockQuantity = toNumber(
      inventoryData.stockQuantity ?? inventoryData.stock_qty
    );
    const minimumStock = toNumber(
      inventoryData.minimumStock ?? inventoryData.stock_alert
    );
    const purchase_price = toNumber(
       inventoryData.purchase_price
    );
      const selling_price = toNumber(
       inventoryData.selling_price
    );
    const totalValue = toNumber(
      inventoryData.totalValue ?? inventoryData.total_amount
    );
    const lastUpdatedDate =
      (inventoryData.lastUpdatedDate as string) ||
      (inventoryData.last_updated as string) ||
      (inventoryData.updated_at as string) ||
      "-";

    const usedQty = toNumber(inventoryData.used_qty);
    const balanceQty = Math.max(stockQuantity - usedQty, 0);
    const statusLabel =
      stockQuantity === 0 ? "Out of Stock" : stockQuantity <= minimumStock ? "Low Stock" : "In Stock";

    return (
      <Box>
        <Box
          display="grid"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          gap={3}
          mb={3}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" mb="4px">
              Last Updated
            </Typography>
            <Typography fontWeight={600}>{lastUpdatedDate}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" mb="4px">
              Purchase Price
            </Typography>
            <Typography fontWeight={600}>{formatINR(purchase_price)}</Typography>
          </Box>
            <Box>
            <Typography variant="body2" color="text.secondary" mb="4px">
              Selling Price
            </Typography>
            <Typography fontWeight={600}>{formatINR(selling_price)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" mb="4px">
              Current Stock
            </Typography>
            <Typography fontWeight={600}>
              {stockQuantity} {unit}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" mb="4px">
              Stock Value
            </Typography>
            <Typography fontWeight={600}>{formatINR(totalValue)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mt={3} mb={3}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Inventory Item (1)
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><Typography fontWeight={600}>Item Name</Typography></TableCell>
                  <TableCell align="center"><Typography fontWeight={600}>Qty</Typography></TableCell>
                  <TableCell align="right"><Typography fontWeight={600}>Purchase Price</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>Selling Price</Typography></TableCell>
                  <TableCell align="right"><Typography fontWeight={600}>Total</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{itemName}</TableCell>
                  <TableCell align="center">
                    {stockQuantity} {unit}
                  </TableCell>
                  <TableCell align="right">{formatINR(purchase_price)}</TableCell>
                     <TableCell align="right">{formatINR(selling_price)}</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>{formatINR(totalValue)}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#fafafa" }}>
                  <TableCell colSpan={4} align="right">
                    <Typography fontWeight={700}>Total</Typography>
                  </TableCell>
                  <TableCell align="right">{formatINR(totalValue)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box mt={3} mb={3} p={2} border="1px solid #e0e0e0" borderRadius={1.5}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Stock Information
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">Category</Typography>
              <Typography>{category}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Min Stock</Typography>
              <Typography>{minimumStock} {unit}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Used Qty</Typography>
              <Typography>{usedQty} {unit}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Balance Qty</Typography>
              <Typography>{balanceQty} {unit}</Typography>
            </Box>
          </Box>
          <Box mt={2}>
            <Chip
              label={statusLabel}
              color={statusLabel === "In Stock" ? "success" : statusLabel === "Low Stock" ? "warning" : "error"}
              size="small"
            />
          </Box>
        </Box>

        {/* <Box mt={3} mb={3} p={2} border="1px solid #e0e0e0" borderRadius={1.5}>
          <Typography variant="h6" fontWeight={600} mb={1}>Attachments</Typography>
          <Typography color="text.secondary">No attachments</Typography>
        </Box>

        <Box mt={3} p={2} border="1px solid #e0e0e0" borderRadius={1.5}>
          <Typography variant="h6" fontWeight={600} mb={1}>Notes</Typography>
          <Typography color="text.secondary">No notes available</Typography>
        </Box> */}
      </Box>
    );
  };

  const renderContent = () => {
    switch (type) {
      case "order":
        return renderOrderDetails(data as Order);
      case "expense":
        return renderExpenseDetails(data as Expense);
      case "purchase":
        return renderPurchaseDetails(data as Purchase);
      case "inventory":
        return renderInventoryDetails(data as Inventory);
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "order":
        return "Order Details";
      case "expense":
        return "Expense Details";
      case "purchase":
        return "Purchase Details";
      case "inventory":
        return "Inventory Details";
      default:
        return "Details";
    }
  };

  const resolvedModalStyle = {
    ...modalStyle,
    width: type === "inventory" ? 1200 : modalStyle.width,
    maxHeight: type === "inventory" ? "90vh" : modalStyle.maxHeight,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={resolvedModalStyle}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}>
          <Typography variant="h5" fontWeight="bold">
            {getTitle()}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        {renderContent()}
      </Box>
    </Modal>
  );
};
