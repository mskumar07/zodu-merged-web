// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Typography,
//   IconButton,
//   Button,
//   Paper,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   TextField,
//   Select,
//   MenuItem,
//   InputAdornment,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
// import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

// interface LedgerRow {
//   date: string;
//   invoice: string;
//   description: string;
//   total: number;
//   paid: number;
//   balance: number;
// }

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   customerName: string;
// }

// const MOCK_DATA: LedgerRow[] = [
//   {
//     date: "10/27/2023",
//     invoice: "INV-8842",
//     description: "POS Sale - Items (2)",
//     total: 1100,
//     paid: 1100,
//     balance: 0,
//   },
//   {
//     date: "10/15/2023",
//     invoice: "INV-8710",
//     description: "POS Sale - Coffee Beans Bulk",
//     total: 8500,
//     paid: 4250,
//     balance: 4250,
//   },
//   {
//     date: "09/28/2023",
//     invoice: "INV-8211",
//     description: "Service Fee",
//     total: 2850,
//     paid: 2850,
//     balance: 0,
//   },
// ];

// const INR = (v: number) =>
//   `₹ ${v.toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

// const filterInputSx = {
//   "& .MuiOutlinedInput-root": {
//     height: 34,
//     borderRadius: "6px",
//     fontSize: 12,
//     backgroundColor: "#F9FBFD",
//     "& fieldset": { borderColor: "#E2E8F0" },
//   },
// };

// function SummaryCard({
//   label,
//   value,
//   color,
//   highlight = false,
// }: {
//   label: string;
//   value: string;
//   color: string;
//   highlight?: boolean;
// }) {
//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         borderRadius: "10px",
//         border: highlight ? "2px solid #EF4444" : "1px solid #E6EDF5",
//         px: 2.5,
//         py: 2,
//         boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
//       }}
//     >
//       <Typography
//         sx={{
//           fontSize: 11,
//           fontWeight: 700,
//           color: "#64748B",
//           mb: 0.7,
//         }}
//       >
//         {label}
//       </Typography>
//       <Typography
//         sx={{
//           fontSize: 20,
//           fontWeight: 900,
//           color,
//         }}
//       >
//         {value}
//       </Typography>
//     </Paper>
//   );
// }

// export default function CustomerLedgerDialog({
//   open,
//   onClose,
//   customerName,
// }: Props) {
//   const totalInvoiced = MOCK_DATA.reduce((s, r) => s + r.total, 0);
//   const totalPaid = MOCK_DATA.reduce((s, r) => s + r.paid, 0);
//   const pending = totalInvoiced - totalPaid;

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       slotProps={{
//         paper: {
//           sx: {
//             width: { xs: "calc(100% - 24px)", sm: "calc(100% - 38px)" },
//             maxWidth: { xs: "100%", md: "1200px" },
//             m: { xs: 1.5, sm: 3 },
//             borderRadius: "12px",
//             overflow: "hidden",
//             boxShadow: "0 24px 60px rgba(15,23,42,0.2)",
//           },
//         },
//       }}
//     >
//       {/* HEADER */}
//       <DialogTitle
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           gap: 1.5,
//           flexWrap: "wrap",
//           px: { xs: 2, sm: 3 },
//           py: { xs: 1.75, sm: 2.2 },
//           borderBottom: "1px solid #EEF2F7",
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
//           <Box sx={{ width: 6, height: 26, bgcolor: "#EF3125", borderRadius: 1 }} />
//           <Typography sx={{ fontWeight: 800, fontSize: { xs: 14, sm: 16 }, lineHeight: 1.25 }}>
//             Customer Payment Ledger -
//             <span style={{ color: "#EF3125", marginLeft: 6 }}>
//               {customerName}
//             </span>
//           </Typography>
//         </Box>

//         <IconButton onClick={onClose}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       {/* CONTENT */}
//       <DialogContent
//         sx={{
//           px: { xs: 2, sm: 3 },
//           py: { xs: 2, sm: 3 },
//           backgroundColor: "#fff",
//         }}
//       >
//         {/* SUMMARY */}
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: { xs: "1fr", sm: "1fr", md: "repeat(3, 1fr)" },
//             gap: { xs: 1.5, sm: 2, md: 2.5 },
//             my: { xs: 2.5, sm: 3, md: 4 },
//           }}
//         >
//           <SummaryCard
//             label="TOTAL INVOICED"
//             value={INR(totalInvoiced)}
//             color="#1E293B"
//           />
//           <SummaryCard
//             label="TOTAL PAID"
//             value={INR(totalPaid)}
//             color="#16A34A"
//           />
//           <SummaryCard
//             label="PENDING BALANCE"
//             value={INR(pending)}
//             color="#EF3125"
//             highlight
//           />
//         </Box>

//         {/* FILTER */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             gap: 1.5,
//             mb: 2,
//             overflowX: "auto",
//             whiteSpace: "nowrap",
//           }}
//         >
//           <Typography
//             sx={{
//               fontSize: 13,
//               fontWeight: 800,
//               color: "#334155",
//             }}
//           >
//             TRANSACTION HISTORY
//           </Typography>

//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1.2,
//               ml: "auto",
//               flexShrink: 0,
//             }}
//           >
//             <Select size="small" defaultValue="all" sx={{ ...filterInputSx, width: 120, height: 34, flexShrink: 0 }}>
//               <MenuItem value="all">All Status</MenuItem>
//               <MenuItem value="paid">Paid</MenuItem>
//               <MenuItem value="pending">Pending</MenuItem>
//             </Select>

//             <TextField
//               size="small"
//               placeholder="mm/dd/yyyy"
//               sx={{ ...filterInputSx, width: 140, flexShrink: 0 }}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748B", flexShrink: 0 }}>
//               TO
//             </Typography>

//             <TextField
//               size="small"
//               placeholder="mm/dd/yyyy"
//               sx={{ ...filterInputSx, width: 140, flexShrink: 0 }}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             <TextField
//               size="small"
//               placeholder="Search Invoice ID..."
//               sx={{ ...filterInputSx, width: 220, flexShrink: 0 }}
//             />
//           </Box>
//         </Box>

//         {/* TABLE */}
//         <Paper
//           elevation={0}
//           sx={{
//             borderRadius: "10px",
//             border: "1px solid #E6EDF5",
//             overflow: "hidden",
//           }}
//         >
//           <Box sx={{ overflowX: "auto" }}>
//             <Table size="small" sx={{ minWidth: 760 }}>
//             <TableHead>
//               <TableRow
//                 sx={{
//                   "& th": {
//                     backgroundColor: "#F1F5F9",
//                     fontSize: 11,
//                     fontWeight: 800,
//                     color: "#475569",
//                     py: 1.3,
//                     px: 1.5,
//                   },
//                 }}
//               >
//                 <TableCell>Date</TableCell>
//                 <TableCell>Invoice ID</TableCell>
//                 <TableCell>Description</TableCell>
//                 <TableCell align="right">Total (₹)</TableCell>
//                 <TableCell align="right">Paid (₹)</TableCell>
//                 <TableCell align="right">Balance (₹)</TableCell>
//                 <TableCell align="center">Action</TableCell>
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {MOCK_DATA.map((row) => (
//                 <TableRow
//                   key={row.invoice}
//                   sx={{
//                     "& td": {
//                       borderBottom: "1px solid #F1F5F9",
//                       px: 1.5,
//                       py: 1.4,
//                       fontSize: 12,
//                     },
//                   }}
//                 >
//                   <TableCell sx={{ color: "#64748B" }}>{row.date}</TableCell>
//                   <TableCell
//                     sx={{
//                       color: "#3B82F6",
//                       fontWeight: 800,
//                       cursor: "pointer",
//                     }}
//                   >
//                     #{row.invoice}
//                   </TableCell>
//                   <TableCell sx={{ color: "#64748B" }}>{row.description}</TableCell>
//                   <TableCell align="right" sx={{ color: "#111827", fontWeight: 600 }}>
//                     {INR(row.total)}
//                   </TableCell>
//                   <TableCell align="right" sx={{ color: "#22C55E", fontWeight: 500 }}>
//                     {INR(row.paid)}
//                   </TableCell>
//                   <TableCell
//                     align="right"
//                     sx={{
//                       color: row.balance ? "#FF3B30" : "#111827",
//                       fontWeight: 800,
//                     }}
//                   >
//                     {INR(row.balance)}
//                   </TableCell>
//                   <TableCell align="center">
//                     <IconButton size="small" sx={{ color: "#FF3B30" }}>
//                       <VisibilityOutlinedIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//             </Table>
//           </Box>
//         </Paper>
//       </DialogContent>

//       {/* FOOTER */}
//       <DialogActions
//         sx={{
//           justifyContent: "space-between",
//           alignItems: { xs: "stretch", sm: "center" },
//           flexDirection: { xs: "column", sm: "row" },
//           gap: { xs: 1.5, sm: 2 },
//           px: { xs: 2, sm: 3 },
//           py: { xs: 1.75, sm: 2 },
//           borderTop: "1px solid #E6EDF5",
//           backgroundColor: "#FFFFFF",
//         }}
//       >
//         <Typography
//           fontSize={12}
//           color="#64748B"
//           sx={{
//             flex: 1,
//             minWidth: 0,
//             lineHeight: 1.4,
//             pr: { xs: 0, sm: 2 },
//           }}
//         >
//           Showing last 12 months of transaction history for {customerName}.
//         </Typography>

//         <Box
//           sx={{
//             display: "flex",
//             alignItems: { xs: "stretch", sm: "center" },
//             justifyContent: "flex-end",
//             flexDirection: { xs: "column", sm: "row" },
//             gap: { xs: 1.25, sm: 3 },
//             width: { xs: "100%", sm: "auto" },
//             flexShrink: 0,
//           }}
//         >
//           <Box sx={{ textAlign: { xs: "left", sm: "right" }, minWidth: { sm: 120 } }}>
//             <Typography fontSize={10} color="#64748B" sx={{ lineHeight: 1.1 }}>
//               TOTAL OUTSTANDING
//             </Typography>
//             <Typography fontSize={18} fontWeight={900} color="#EF3125" sx={{ lineHeight: 1.15, mt: 0.25 }}>
//               {INR(pending)}
//             </Typography>
//           </Box>

//           <Button
//             variant="contained"
//             startIcon={<PrintOutlinedIcon />}
//             sx={{
//               height: 40,
//               minWidth: 196,
//               width: { xs: "100%", sm: "auto" },
//               borderRadius: "8px",
//               px: 3,
//               bgcolor: "#EF3125",
//               whiteSpace: "nowrap",
//               fontWeight: 800,
//               boxShadow: "0 6px 16px rgba(239,49,37,0.3)",
//               "&:hover": { bgcolor: "#D92D20" },
//             }}
//           >
//             PRINT LEDGER [F12]
//           </Button>
//         </Box>
//       </DialogActions>
//     </Dialog>
//   );
// }
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Link,
  Grid,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#dc2626',
    },
    success: {
      main: '#16a34a',
    },
    error: {
      main: '#dc2626',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

interface SalesTransaction {
  date: string;
  id: string;
  description: string;
  total: number;
  paid: number;
  balance: number;
  isReturn?: boolean;
}

interface PaymentTransaction {
  date: string;
  invoiceId: string;
  type: string;
  method: string;
  amount: number;
  isRefund?: boolean;
}

interface CustomerLedgerModalProps {
  open: boolean;
  onClose: () => void;
  customerName?: string;
}

const CustomerLedgerModal: React.FC<CustomerLedgerModalProps> = ({
  open,
  onClose,
  customerName = 'John Doe',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Sample data
  const salesData: SalesTransaction[] = [
    {
      date: '10/27/2023',
      id: '#INV-8842',
      description: 'POS Sale - Electronics',
      total: 1100.0,
      paid: 1100.0,
      balance: 0.0,
    },
    {
      date: '10/15/2023',
      id: '#INV-8710',
      description: 'POS Sale - Coffee Beans Bulk',
      total: 8500.0,
      paid: 4250.0,
      balance: 4250.0,
    },
    {
      date: '10/10/2023',
      id: '#RET-442',
      description: 'Sales Return - Damaged Goods',
      total: -1200.0,
      paid: 0.0,
      balance: -1200.0,
      isReturn: true,
    },
    {
      date: '09/28/2023',
      id: '#INV-8211',
      description: 'Service Fee - Maintenance',
      total: 2850.0,
      paid: 2850.0,
      balance: 0.0,
    },
  ];

  const paymentsData: PaymentTransaction[] = [
    {
      date: '10/25/2023',
      invoiceId: '#INV-8842',
      type: 'Payment Received',
      method: 'UPI',
      amount: 2500.0,
    },
    {
      date: '10/26/2023',
      invoiceId: '#INV-8842',
      type: 'Payment Received',
      method: 'Cash',
      amount: 500.0,
    },
    {
      date: '10/12/2023',
      invoiceId: '#RET-442',
      type: 'Payment Refunded',
      method: 'Cash',
      amount: -1200.0,
      isRefund: true,
    },
    {
      date: '10/01/2023',
      invoiceId: '#INV-8710',
      type: 'Payment Received',
      method: 'Cash',
      amount: 3000.0,
    },
    {
      date: '09/15/2023',
      invoiceId: '#RET-390',
      type: 'Credit Note Issued',
      method: 'Store Credit',
      amount: -550.0,
      isRefund: true,
    },
    {
      date: '08/30/2023',
      invoiceId: '#INV-8211',
      type: 'Payment Received',
      method: 'Bank Transfer',
      amount: 1500.0,
    },
    {
      date: '07/15/2023',
      invoiceId: '#INV-7992',
      type: 'Payment Received',
      method: 'Cash',
      amount: 2300.0,
    },
  ];

  const summary = {
    totalInvoiced: 24950.0,
    totalPaid: 21200.0,
    pendingBalance: 3750.0,
  };

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    return amount < 0 ? `(${absAmount.toFixed(2)})` : absAmount.toFixed(2);
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: '1280px',
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 32,
                bgcolor: 'primary.main',
                borderRadius: 999,
              }}
            />
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.25rem' }}>
              Customer Payment Ledger -{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {customerName}
              </Box>
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Customer Summary Section */}
        <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Total Invoiced
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: '#1e293b' }}>
                    ₹ {summary.totalInvoiced.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Total Paid
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: '#16a34a' }}>
                    ₹ {summary.totalPaid.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ border: '2px solid #dc2626' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Pending Balance
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: '#dc2626' }}>
                    ₹ {summary.pendingBalance.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Content */}
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Sales & Returns Section */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 16,
                      bgcolor: 'primary.main',
                      borderRadius: 999,
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#334155',
                      textTransform: 'uppercase',
                    }}
                  >
                    Sales &amp; Returns
                  </Typography>
                </Box>
                <TextField
                  size="small"
                  placeholder="Search Invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    width: 200,
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.75rem',
                      bgcolor: 'white',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  maxHeight: 280,
                  overflow: 'auto',
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        ID
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Description
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Total (₹)
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Paid (₹)
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Balance (₹)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:hover': { bgcolor: '#f8fafc' },
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <TableCell sx={{ fontSize: '0.875rem', color: '#475569', py: 1.5 }}>
                          {row.date}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Link
                            href="#"
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#2563eb',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {row.id}
                          </Link>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '0.875rem',
                            color: row.isReturn ? '#dc2626' : '#64748b',
                            fontStyle: row.isReturn ? 'italic' : 'normal',
                            py: 1.5,
                          }}
                        >
                          {row.description}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: '0.875rem', fontWeight: 500, py: 1.5 }}
                        >
                          {formatCurrency(row.total)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: '0.875rem',
                            color: row.paid > 0 ? '#16a34a' : '#94a3b8',
                            py: 1.5,
                          }}
                        >
                          {formatCurrency(row.paid)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color:
                              row.balance > 0
                                ? '#dc2626'
                                : row.balance < 0
                                ? '#16a34a'
                                : 'inherit',
                            py: 1.5,
                          }}
                        >
                          {formatCurrency(row.balance)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <IconButton size="small" sx={{ color: '#dc2626' }}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Payment History Section */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 16,
                      bgcolor: '#22c55e',
                      borderRadius: 999,
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#334155',
                      textTransform: 'uppercase',
                    }}
                  >
                    Payment History
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    sx={{
                      fontSize: '0.75rem',
                      bgcolor: 'white',
                    }}
                  >
                    <MenuItem value="all">All Methods</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="bank">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  maxHeight: 280,
                  overflow: 'auto',
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Invoice ID
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Transaction Type
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Method
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Amount (₹)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#f8fafc',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#475569',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        Receipt
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentsData.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:hover': { bgcolor: '#f8fafc' },
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <TableCell sx={{ fontSize: '0.875rem', color: '#475569', py: 1.5 }}>
                          {row.date}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Link
                            href="#"
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#2563eb',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {row.invoiceId}
                          </Link>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: row.isRefund ? '#dc2626' : '#1e293b',
                            fontStyle: row.isRefund ? 'italic' : 'normal',
                            py: 1.5,
                          }}
                        >
                          {row.type}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#64748b', py: 1.5 }}>
                          {row.method}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: row.amount < 0 ? '#dc2626' : '#16a34a',
                            py: 1.5,
                          }}
                        >
                          {formatCurrency(row.amount)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <IconButton size="small" sx={{ color: '#94a3b8' }}>
                            <DownloadIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.875rem' }}>
            Showing segregated transaction history for {customerName}.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                Total Outstanding
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: '#dc2626', lineHeight: 1, mt: 0.5 }}
              >
                ₹ {summary.pendingBalance.toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              sx={{
                bgcolor: '#dc2626',
                fontWeight: 700,
                px: 3,
                py: 1.25,
                textTransform: 'none',
                boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)',
                '&:hover': {
                  bgcolor: '#b91c1c',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              PRINT LEDGER [F12]
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default CustomerLedgerModal;
