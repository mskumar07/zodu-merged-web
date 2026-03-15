// @components/PurchaseTable/PurchaseModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Chip,
  Avatar,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { formatDateTime, getFileType } from "@utils/util";

interface PurchaseItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  purchase_price: number;
  selling_price: number;
  gst_tax: number;
  total_price: number;
}

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  data?: {
    id: string;
    purchase_id: string;
    vendor_name: string;
    category: string;
    purchase_date: string;
    purchase_type: "Product" | "Other";
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    payment_type: string;
    notes: string;
    attachment_url: Array<{
      id: string;
      filename: string;
      url: string;
      type?: string;
    }>;
    items: PurchaseItem[];
    payment_history?: Array<{
      payment_id: string;
      payment_mode: string;
      payment_date: string;
      amount: number;
    }>;
    created_by?: {
      name: string;
      initials: string;
      department: string;
      color: string;
    };
    vendor?: {
      name: string;
      company_name: string;
      vendor_phone: string;
      vendor_email: string;
      vendor_address: string;
    };
  };
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const [preview, setPreview] = useState<any>(null);

  if (!data) return null;

  // Helper to check if a file is an image
  const isFileImage = (filename: string): boolean => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext || "");
  };

  const handlePreview = (file: any) => {
    if (isFileImage(file.filename)) {
      setPreview(file); // dialog preview
    } else {
      window.open(file.url, "_blank"); // open PDF/DOC
    }
  };

  console.log("modal data:", data);

  // Calculate totals
  const totalQuantity =
    data.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
  const totalTax =
    data.items?.reduce((sum, item) => sum + item.gst_tax, 0) || 0;
  const totalPurchasePrice =
    data.items?.reduce(
      (sum, item) => sum + item.purchase_price * item.qty,
      0
    ) || 0;
  const totalSellingPrice =
    data.items?.reduce((sum, item) => sum + item.selling_price * item.qty, 0) ||
    0;
  const totalPrice =
    data.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  const balanceAmount =
    data.balance_amount || Math.max(data.total_amount - data.paid_amount, 0);

  // Process payment history data
  const paymentHistory = data.payment_history || [];
  const hasPaymentHistory = paymentHistory.length > 0;

  // Format payment mode for display
  const formatPaymentMode = (mode: string) => {
    const modes: Record<string, string> = {
      cash: "Cash",
      card: "Card",
      upi: "UPI",
      credit: "Credit",
      bank_transfer: "Bank Transfer",
      cheque: "Cheque",
      online: "Online",
    };
    return (
      modes[mode] || mode?.charAt(0).toUpperCase() + mode?.slice(1) || "N/A"
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      {/* <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">
            Purchase ID{data.purchase_id || data.id}
          </Typography>
          {/* <Chip
            label={
              data.purchase_type === "Product"
                ? "Product Purchase"
                : "Other Purchase"
            }
            size="small"
            color={data.purchase_type === "Product" ? "primary" : "secondary"}
          /> */}
        {/*</Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle> */}

      <DialogTitle
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 2,
    pb: 2,
  }}
>
  {/* 🔹 Row 1: Title + Close */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography variant="h6">
      Purchase ID {data.purchase_id || data.id}
    </Typography>

    <IconButton onClick={onClose}>
      <CloseIcon />
    </IconButton>
  </Box>

  {/* 🔹 Row 2: Purchase Date & Amounts */}
  <Box
    display="grid"
    gridTemplateColumns="repeat(4, 1fr)"
    gap={3}
  >
    <Box>
      <Typography variant="body2" color="textSecondary" mb="4px">
        Purchase Date
      </Typography>
      <Typography fontWeight={500}>
        {formatDateTime(data.purchase_date)} {/*Z-i34 */}
      </Typography>
    </Box>

    <Box>
      <Typography variant="body2" color="textSecondary" mb="4px">
        Total Amount
      </Typography>
      <Typography fontWeight={600}>
        ₹{data.total_amount?.toFixed(2)}
      </Typography>
    </Box>

    <Box>
      <Typography variant="body2" color="textSecondary" mb="4px">
        Amount Paid
      </Typography>
      <Typography fontWeight={600} color="success.main">
        ₹{data.paid_amount?.toFixed(2)}
      </Typography>
    </Box>

    <Box>
      <Typography variant="body2" color="textSecondary" mb="4px">
        Balance Amount
      </Typography>
      <Typography
        fontWeight={600}
        color={balanceAmount > 0 ? "error" : "success"}
      >
        ₹{balanceAmount?.toFixed(2)}
      </Typography>
    </Box>
  </Box>
</DialogTitle>

      <DialogContent sx={{  height: "600px", //adjusted the height zodu-hot fix 
                  overflowY: "auto", // vertical scroll only when needed
                    scrollbarWidth: "thin", // for Firefox
                  "&::-webkit-scrollbar": {
                    width: "8px", // scrollbar width
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#aaa", // scrollbar color
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1", // track color
                  },
                   }}>
        {/* First row: Purchase ID, Vendor, Created By */}
        {/* <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={3} mb={3}>
          <Box>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginBottom: "4px" }}>
              Purchase ID
            </Typography>
            <Typography fontWeight={600}>
              {data.purchase_id || data.id}
            </Typography>
          </Box>
          {/*removed vendor information */}
          {/* <Box>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginBottom: "4px" }}>
              Vendor
            </Typography>
            <Typography>
              {data.vendor?.company_name || data.vendor_name}
            </Typography>
            {data.vendor?.vendor_phone && (
              <Typography variant="caption" color="textSecondary">
                {data.vendor.vendor_phone}
              </Typography>
            )}
          </Box> */}
         {/* <Box>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginBottom: "8px" }}>
              Created By
            </Typography>
            {data.created_by ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    bgcolor: data.created_by.color,
                    width: "32px",
                    height: "32px",
                    fontSize: "0.875rem",
                  }}>
                  {data.created_by.initials}
                </Avatar>
                <Box>
                  <Typography fontWeight={500} sx={{ fontSize: "0.875rem" }}>
                    {data.created_by.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {data.created_by.department}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2">-</Typography>
            )}
          </Box>
        </Box> */}

        {/* Second row: Purchase Date, Amounts */}


        {/* Purchase Items Table */}
        <Box mt={3} mb={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Purchase Items ({data.items?.length || 0})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <Typography variant="subtitle2">Item Name</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2">Qty</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2">Unit</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Purchase Price</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Selling Price</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">GST Tax</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Total</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items?.map((item, index) => (
                  <TableRow key={`${item.id}-${index}`}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="center">{item.qty}</TableCell>
                    <TableCell align="center">{item.unit || "-"}</TableCell>
                    <TableCell align="right">
                      ₹{item.purchase_price?.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{item.selling_price?.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{item.gst_tax?.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{item.total_price?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="subtitle2">Totals:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">
                      ₹{totalPurchasePrice?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">
                      ₹{totalSellingPrice?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" color="error">
                      ₹{totalTax?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={700}>
                      ₹{totalPrice || data.total_amount?.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="textSecondary">
              Total Items: {data.items?.length || 0}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total Quantity: {totalQuantity}
            </Typography>
          </Box>
        </Box>

        {/* Payment History Table */}
        <Box mt={3} mb={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Payment Information
          </Typography>

          {hasPaymentHistory ? (
            <TableContainer component={Paper} variant="outlined"
    sx={{
      maxHeight: 200,        // 👈 control scroll height
      overflowY: "auto",
    }}
  >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>
                      <Typography variant="subtitle2">Date</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Payment ID</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Payment Type</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">Amount</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((payment, index) => (
                    <TableRow
                      key={payment.payment_id || index}
                      sx={{
                        "&:hover": { backgroundColor: "#fafafa" },
                      }}>
                      <TableCell>
                      <Typography variant="body2">
                          {/* formatted from backend itself */}
                          {payment.payment_date} 
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.payment_id || `PAY-${index + 1}`}
                        </Typography>
                      </TableCell>
                     
                      <TableCell>
                        <Typography variant="body2">
                          {formatPaymentMode(payment.payment_mode)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₹{payment.amount?.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Totals Row */}
                  <TableRow
                    sx={{
                      backgroundColor: "#f9f9f9",
                      borderTop: "2px solid #e0e0e0",
                    }}>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Total Paid:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={700}>
                        ₹{data.paid_amount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            /* Fallback to original Payment Information if no payment history */
            <Box p={2} border="1px solid #e0e0e0" borderRadius={1}>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Payment Status
                  </Typography>
                  <Chip
                    label={balanceAmount === 0 ? "Paid" : "Partial"}
                    color={balanceAmount === 0 ? "success" : "warning"}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography>{data.payment_type || "N/A"}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Vendor Information */}
        <Box mt={3} mb={3} p={2} border="1px solid #e0e0e0" borderRadius={1}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Vendor Information
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Company
              </Typography>
              <Typography>
                {data.vendor?.company_name || data.vendor_name || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Contact Person
              </Typography>
              <Typography>
                {data.vendor?.name || data.vendor_name || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Phone
              </Typography>
              <Typography>{data.vendor?.vendor_phone || "N/A"}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Email
              </Typography>
              <Typography>{data.vendor?.vendor_email || "N/A"}</Typography>
            </Box>
            {data.vendor?.vendor_address && (
              <Box gridColumn="span 2">
                <Typography variant="body2" color="textSecondary">
                  Address
                </Typography>
                <Typography>{data.vendor.vendor_address}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Notes */}
        {data.notes && (
          <Box mt={3} mb={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Notes
            </Typography>
            <Box p={2} bgcolor="#f9f9f9" borderRadius={1}>
              <Typography>{data.notes}</Typography>
            </Box>
          </Box>
        )}

        {/* Attachments */}
        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
            Attachments ({data.attachment_url?.length || 0})
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {data.attachment_url?.length ? (
              data.attachment_url.map((file, index) => {
                const type = getFileType(file);

                return (
                  <Box
                    key={file.id || index}
                    onClick={() => handlePreview(file)}
                    sx={{
                      width: 100,
                      cursor: "pointer",
                      textAlign: "center",
                    }}>
                    {/* Preview Box */}
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        backgroundColor: "#fafafa",
                        "&:hover": {
                          borderColor: "#1976d2",
                          backgroundColor: "#f0f7ff",
                        },
                      }}>
                      {isFileImage(file.filename) ? (
                        <img
                          src={file.url}
                          alt={file.filename}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : type === "pdf" ? (
                        <PictureAsPdfIcon color="error" fontSize="large" />
                      ) : type === "doc" ? (
                        <DescriptionIcon color="primary" fontSize="large" />
                      ) : (
                        <InsertDriveFileIcon fontSize="large" />
                      )}
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1,
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                      {file.filename || `Attachment ${index + 1}`}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Typography variant="body2" color="textSecondary">
                No attachments
              </Typography>
            )}
          </Box>
        </Box>

        {/* Preview Dialog */}
        <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md">
          <IconButton
            onClick={() => setPreview(null)}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              zIndex: 10,
              backgroundColor: "rgba(0,0,0,0.05)",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.1)",
              },
            }}>
            <CloseIcon />
          </IconButton>
          <DialogContent>
            {preview && isFileImage(preview.filename) ? (
              <img
                src={preview?.url}
                alt={preview?.filename}
                style={{ width: "100%", borderRadius: 8 }}
              />
            ) : preview && !isFileImage(preview.filename) ? (
              <iframe
                src={preview.url}
                title="File Preview"
                width="100%"
                height="500px"
                style={{ border: "none" }}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
