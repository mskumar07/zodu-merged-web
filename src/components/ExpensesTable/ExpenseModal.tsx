import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  useGetExpenseByIdQuery,
  type ExpenseItem,
} from "@store/services/expenseApi";
import AttachmentViewer from "./AttachmentViewer";
import { formatDateTime, getFileType } from "@utils/util";
import React, { useState } from "react";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onEdit?: (item: ExpenseItem) => void;
  onDelete?: (item: ExpenseItem) => void;
  home?: boolean;
  data?: {
    id: string;
    name: string;
    category: string;
    billDate: string;
    totalAmount: number;
    amountPaid: number;
    paymentMethod: string;
    allocatedTo: {
      name: string;
      initials: string;
      department: string;
      color: string;
    };
  };
}

const staticData = {
  purchase_id: "PUR-1024",
  id: "1024",
  purchase_type: "direct",
  purchase_date: "15 Sep 2025",

  total_amount: 12500,
  paid_amount: 10000,
  payment_type: "UPI",

  created_by: {
    name: "Murali Krishna",
    department: "Procurement",
    initials: "MK",
    color: "#1976d2",
  },

  vendor: {
    company_name: "ABC Traders Pvt Ltd",
    name: "Ramesh Kumar",
    vendor_phone: "9876543210",
    vendor_email: "abc.traders@gmail.com",
    vendor_address: "12, Industrial Area, Bengaluru",
  },

  items: [
    {
      id: "1",
      name: "Basmati Rice",
      qty: 10,
      unit: "Kg",
      purchase_price: 80,
      selling_price: 95,
      gst_tax: 50,
      total_price: 850,
    },
    {
      id: "2",
      name: "Sunflower Oil",
      qty: 5,
      unit: "Ltr",
      purchase_price: 150,
      selling_price: 175,
      gst_tax: 60,
      total_price: 810,
    },
  ],

  notes: "Goods received in good condition.",

  attachment_url: [
    {
      url: "https://via.placeholder.com/300",
      filename: "invoice-image.png",
    },
    {
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      filename: "invoice.pdf",
    },
  ],
};

const paymentDetails = [
  {
    id: 1,
    status: "Paid",
    type: "UPI",
    amount: 5000,
    date: "15 Sep 2025",
    reference: "UPI123456",
  },
  {
    id: 2,
    status: "Paid",
    type: "Cash",
    amount: 3000,
    date: "16 Sep 2025",
    reference: "CASH-01",
  },
  {
    id: 3,
    status: "Partial",
    type: "Bank Transfer",
    amount: 2000,
    date: "17 Sep 2025",
    reference: "HDFC789456",
  },
];

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  open,
  onClose,
  home=false,
  data,
  onEdit,
  onDelete,
}) => {
  const [preview, setPreview] = useState(null);
  const expenseId = data?.expense_id || data?.id;
  const {
    data: expenseData,
    isLoading: isLoadingExpense,
    error: expenseError,
  } = useGetExpenseByIdQuery(expenseId, {
    skip: !expenseId || !open,
  });


  if (!data) return null;
  if (isLoadingExpense) return <div>Loading...</div>;
  if (expenseError) return <div>Error loading expense data.</div>;
  const expense = expenseData?.Data;
  // console.log(expense.payment_history, "payment_history")
  const handlePreview = (file) => {
    const type = getFileType(file);

    if (type === "image") {
      setPreview(file); // dialog preview
    } else {
      window.open(file.url, "_blank"); // open PDF/DOC
    }
  };
  const totalAmount = Number(expense?.total_amount || 0);
  const paidAmount = Number(expense?.paid_amount || 0);
  const balanceAmount = Number(expense?.balance_amount || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh", // 🔑 forces scroll area
        },
      }}
    >
      {/* <DialogTitle
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="h6">Expense# {expense?.expense_id}</Typography>
      </Box>
      <Box>
        <IconButton onClick={() => onEdit?.(expense)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete?.(expense)}>
          <DeleteIcon />
        </IconButton>
      </Box>
      </Box>
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
        {/* 🔹 Top row: Title + Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">Expense# {expense?.expense_id}</Typography>

           {!home && (
  <Stack direction="row" spacing={1}>
    <IconButton onClick={() => onEdit?.(expense)}>
      <EditIcon />
    </IconButton>

    <IconButton onClick={() => onDelete?.(expense)}>
      <DeleteIcon />
    </IconButton>
  </Stack>
)}

          </Box>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 🔹 Bottom row: Summary details (previous second row) */}
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={3}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Expense Date
            </Typography>
            <Typography fontWeight={600}>
              {expense?.updated_at
                ? formatDateTime(expense.updated_at)
                : "-"}
                {/*Z-i34 */}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Amount
            </Typography>
            <Typography fontWeight={600}>₹{totalAmount}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary">
              Amount Paid
            </Typography>
            <Typography color="success.main" fontWeight={600}>
              ₹{paidAmount}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary">
              Balance Amount
            </Typography>
            <Typography
              color={balanceAmount > 0 ? "error" : "success"}
              fontWeight={600}
            >
              ₹{balanceAmount}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          height: "410px", //adjusted the height zodu-hot fix
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
        }}
      >
        {/* ExpenseItems */}
        <Box mt={3} mb={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Expense Items ({expense?.items?.length || 0})
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Qty
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Expense Price
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {expense?.items?.map((item) => (
                  <TableRow key={item.item_id}>
                    <TableCell>{item.item_name}</TableCell>

                    <TableCell align="center">{item.quantity}</TableCell>

                    <TableCell align="right">
                      ₹{Number(item.price).toFixed(2)}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals */}
                <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                  <TableCell colSpan={3} align="right">
                    <Typography fontWeight={600}>Total</Typography>
                  </TableCell>

                  <TableCell align="right" fontWeight={700}>
                    ₹
                    {expense?.items
                      ?.reduce(
                        (sum, item) => sum + Number(item.price) * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Payment Info */}
        <Box mt={3} mb={3} p={2} border="1px solid #e0e0e0" borderRadius={1}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Payment Information
          </Typography>
          <TableContainer
            sx={{
              maxHeight: 200, // 👈 control scroll height
              overflowY: "auto",
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment Id</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {expense?.payment_history?.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {formatDateTime(payment.created_at)}
                      {/*Z-i34 */}
                    </TableCell>
                    <TableCell>{payment.payment_id}</TableCell>
                    <TableCell>{payment.payment_type}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{payment.paid_amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Total Paid */}
                <TableRow sx={{ backgroundColor: "#fafafa" }}>
                  <TableCell colSpan={3} align="right">
                    <Typography fontWeight={600}>Total Paid</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700} color="success.main">
                      ₹
                      {expense?.payment_history
                        ?.reduce(
                          (sum, item) => sum + Number(item.paid_amount),
                          0
                        )
                        .toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Attachments */}
        <Box mt={3} p={2} border="1px solid #e0e0e0" borderRadius={1}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Attachments
          </Typography>
          {/* <Box mt={1} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {expense?.attachment_url?.map((attachment, index) => (
              <Box key={index} mb={1}>
                <Link href={attachment.url} target="_blank" rel="noopener noreferrer">
                  {attachment.filename}
                </Link>
                 {index < staticData.attachment_url.length - 1 && ","}
              </Box>
            ))}
          </Box> */}
          <AttachmentViewer attachments={expense?.attachment_url || []} />
        </Box>
        {/* Notes */}
        <Box mt={3} p={2} border="1px solid #e0e0e0" borderRadius={1}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Notes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {expense?.description || "-"}
          </Typography>
        </Box>
        <Box
          display="grid"
          gridTemplateColumns="1fr 1fr 1fr"
          gap={3}
          mb={3}
          sx={{ mt: 2, ml: 1 }}
        >
          {/* <Box>
            <Typography variant="body2" color="textSecondary" mb="4px">
              ExpenseID
            </Typography>
            <Typography fontWeight={600}>{expense?.expense_id}</Typography>
          </Box> */}

          <Box>
            <Typography variant="body2" color="textSecondary" mb="8px">
              Created By
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                sx={{
                  bgcolor: staticData.created_by.color,
                  width: 32,
                  height: 32,
                  fontSize: "0.875rem",
                }}
              >
                {staticData.created_by.initials}
              </Avatar>
              <Box>
                <Typography fontWeight={500} fontSize="0.875rem">
                  {staticData.created_by.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {staticData.created_by.department}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;
