import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AddNewCustomerDialog from "./Addnewcustomerdialog";

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#E11D48" },
    background: { default: "#F9FAFB", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, fontWeight: 700 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #F3F4F6",
          padding: "10px 16px",
          fontSize: 13,
        },
        head: {
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.07em",
          color: "#6B7280",
          textTransform: "uppercase",
          backgroundColor: "#F9FAFB",
          borderBottom: "2px solid #E5E7EB",
          padding: "12px 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        },
      },
    },
  },
});

// ─── Types ────────────────────────────────────────────────────
interface Customer {
  id: string;
  businessName: string;
  contactName: string;
  mobile: string;
  email: string;
  address: string;
  gstin: string;
  outstandingBalance: number;
  placeOfSupply: string;
}

// ─── Mock Data ────────────────────────────────────────────────
const INITIAL_CUSTOMERS: Customer[] = [
  { id: "1",  businessName: "ABC Motors",       contactName: "Rajesh Kumar",    mobile: "9876543210", email: "rajesh@abcmotors.com",         address: "101, Industrial Area, Phase II, Pune",            gstin: "27AAAAA0000A1Z5", outstandingBalance: 4250,  placeOfSupply: "Maharashtra"     },
  { id: "2",  businessName: "Global Tech",      contactName: "Sarah Chen",      mobile: "9123456789", email: "sarah.chen@globaltech.in",     address: "Suite 405, Tech Hub, Electronic City, Bengaluru", gstin: "",               outstandingBalance: 0,     placeOfSupply: "Karnataka"       },
  { id: "3",  businessName: "Elite Fashion",    contactName: "Priya Singh",     mobile: "9812345678", email: "contact@elitefashion.com",     address: "G-12, South Ex Mall, Ring Road, New Delhi",       gstin: "07AAAEF1234B1Z2", outstandingBalance: 12850, placeOfSupply: "Delhi"           },
  { id: "4",  businessName: "Oceanic Exports",  contactName: "Vikram Roy",      mobile: "9000123456", email: "vroy@oceanic.in",              address: "88 Harbor View, Beach Rd, Chennai",               gstin: "33AAAOE9988C1Z9", outstandingBalance: 450,   placeOfSupply: "Tamil Nadu"      },
  { id: "5",  businessName: "Zeno Logistics",   contactName: "David Miller",    mobile: "8888777666", email: "david@zenologistics.com",      address: "Warehouse 5, Port Trust Area, Mumbai",            gstin: "",               outstandingBalance: 82000, placeOfSupply: "Maharashtra"     },
  { id: "6",  businessName: "Vibrant Arts",     contactName: "Anita Deshpande", mobile: "9765431209", email: "anita@vibrantarts.in",         address: "Studio 2, Art Colony, Navi Mumbai",               gstin: "27AABVA1122C1Z4", outstandingBalance: 0,     placeOfSupply: "Maharashtra"     },
  { id: "7",  businessName: "Phoenix Retail",   contactName: "Arjun Mehra",     mobile: "9911223344", email: "arjun@phoenix.com",            address: "M.I. Road, Opp. City Palace, Jaipur",             gstin: "08AAAPR5566D1Z1", outstandingBalance: 2150,  placeOfSupply: "Rajasthan"       },
  { id: "8",  businessName: "Sunshine Organics",contactName: "Meera Nair",      mobile: "9234567890", email: "meera@sunshine.org",           address: "Green Park, MG Road, Kochi",                      gstin: "",               outstandingBalance: 0,     placeOfSupply: "Kerala"          },
  { id: "9",  businessName: "Tech Solutions",   contactName: "Amit Verma",      mobile: "9822334455", email: "amit@techsolutions.com",       address: "Block B, Salt Lake, Sector V, Kolkata",           gstin: "19AAATS4433E1Z7", outstandingBalance: 5600,  placeOfSupply: "West Bengal"     },
  { id: "10", businessName: "Royal Sweets",     contactName: "Sanjay Gupta",    mobile: "9345678901", email: "sanjay@royalsweets.in",        address: "Hazratganj Main Market, Lucknow",                 gstin: "",               outstandingBalance: 0,     placeOfSupply: "Uttar Pradesh"   },
  { id: "11", businessName: "Modern Hardware",  contactName: "Kavita Shah",     mobile: "9820011223", email: "kavita@modernhardware.com",    address: "Plot 44, GIDC Industrial Estate, Ahmedabad",      gstin: "24AAAMH3322F1Z6", outstandingBalance: 14200, placeOfSupply: "Gujarat"         },
  { id: "12", businessName: "Blue Diamond",     contactName: "Rohan Jha",       mobile: "9567890123", email: "rohan@bluediamond.in",         address: "Frazer Road, Near Station, Patna",                gstin: "",               outstandingBalance: 0,     placeOfSupply: "Bihar"           },
  { id: "13", businessName: "Everest Travels",  contactName: "Suman Rao",       mobile: "9456781234", email: "suman@everesttravels.com",     address: "Cyber Towers, Hitech City, Hyderabad",            gstin: "36AAAET0011G1Z8", outstandingBalance: 780,   placeOfSupply: "Telangana"       },
  { id: "14", businessName: "Green Leaf",       contactName: "Pooja Reddy",     mobile: "9344556677", email: "pooja@greenleaf.in",           address: "Opp. Beach Park, Vishakhapatnam",                 gstin: "",               outstandingBalance: 0,     placeOfSupply: "Andhra Pradesh"  },
  { id: "15", businessName: "Alpha Pharma",     contactName: "Nitin Bose",      mobile: "9900887766", email: "nitin@alphapharma.com",        address: "Medical Plaza, Chowringhee, Kolkata",             gstin: "19AAABP9988H1Z2", outstandingBalance: 3900,  placeOfSupply: "West Bengal"     },
];

const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(v);

// ─── Component ────────────────────────────────────────────────
interface CustomerManagementProps {
  onAddCustomer?: () => void;
  onEditCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (id: string) => void;
}

export default function CustomerManagement({
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
}: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    
  

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      c =>
        `${c.businessName} ${c.contactName}`.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this customer?")) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      onDeleteCustomer?.(id);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#F9FAFB",
          overflow: "hidden",
        }}
      >
        {/* ── Toolbar ── */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#fff",
            borderBottom: "1px solid #E5E7EB",
            flexShrink: 0,
            gap: 2,
          }}
        >
          {/* Search */}
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, or GSTIN…"
            size="small"
            sx={{
              flex: 1,
              maxWidth: 420,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#F8FAFC",
                fontSize: 13,
                "& fieldset": { borderColor: "#E5E7EB" },
                "&:hover fieldset": { borderColor: "#E11D48" },
                "&.Mui-focused fieldset": { borderColor: "#E11D48", borderWidth: 2 },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Right side actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>
              Showing{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "#1A1A2E" }}>
                {filtered.length}
              </Box>{" "}
              customers
            </Typography>

            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                borderColor: "#E5E7EB",
                color: "#374151",
                px: 1.5,
                py: 0.7,
                borderRadius: 1.5,
                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
              }}
            >
              Export CSV
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                borderColor: "#E5E7EB",
                color: "#374151",
                px: 1.5,
                py: 0.7,
                borderRadius: 1.5,
                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
              }}
            >
              Print List
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => setAddCustomerOpen(true)}
              disableElevation
              sx={{
                fontSize: 13,
                fontWeight: 700,
                bgcolor: "#E11D48",
                color: "#fff",
                px: 2,
                py: 0.8,
                borderRadius: 1.5,
                boxShadow: "0 4px 14px rgba(225,29,72,0.3)",
                "&:hover": { bgcolor: "#BE123C" },
                "&:active": { transform: "scale(0.97)" },
                transition: "all 0.15s",
              }}
            >
              Add New Customer
            </Button>
          </Box>
        </Box>

        {/* ── Table ── */}
        <Box sx={{ flex: 1, overflow: "hidden", px: 3, py: 2 }}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              overflow: "hidden",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer / Business Name</TableCell>
                    <TableCell>Mobile Number</TableCell>
                    <TableCell>Email Address</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>GSTIN</TableCell>
                    <TableCell align="right">Outstanding Balance</TableCell>
                    <TableCell>Place of Supply</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                          No customers found for "{search}"
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(customer => (
                      <TableRow
                        key={customer.id}
                        sx={{
                          "&:hover": { bgcolor: "#FFF1F2" },
                          transition: "background 0.12s",
                          cursor: "default",
                        }}
                      >
                        {/* Name */}
                        <TableCell>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap" }}>
                            {customer.businessName}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                            {customer.contactName}
                          </Typography>
                        </TableCell>

                        {/* Mobile */}
                        <TableCell>
                          <Typography sx={{ fontSize: 13, color: "#374151", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                            {customer.mobile}
                          </Typography>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <Typography sx={{ fontSize: 12, color: "#4B5563", whiteSpace: "nowrap" }}>
                            {customer.email}
                          </Typography>
                        </TableCell>

                        {/* Address */}
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#6B7280",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 200,
                            }}
                            title={customer.address}
                          >
                            {customer.address}
                          </Typography>
                        </TableCell>

                        {/* GSTIN */}
                        <TableCell>
                          {customer.gstin ? (
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontFamily: "monospace",
                                color: "#374151",
                                bgcolor: "#F3F4F6",
                                border: "1px solid #E5E7EB",
                                borderRadius: 1,
                                px: 0.7,
                                py: 0.2,
                                display: "inline-block",
                                whiteSpace: "nowrap",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {customer.gstin}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: 12, color: "#D1D5DB" }}>—</Typography>
                          )}
                        </TableCell>

                        {/* Balance */}
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "monospace",
                              color: customer.outstandingBalance > 0 ? "#E11D48" : "#374151",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {INR(customer.outstandingBalance)}
                          </Typography>
                        </TableCell>

                        {/* Place of Supply */}
                        <TableCell>
                          <Chip
                            label={customer.placeOfSupply}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 600,
                              height: 20,
                              bgcolor: "#F3F4F6",
                              color: "#374151",
                              border: "1px solid #E5E7EB",
                            }}
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                            <Tooltip title="Edit" placement="top">
                              <IconButton
                                size="small"
                                onClick={() => onEditCustomer?.(customer)}
                                sx={{
                                  color: "#E11D48",
                                  p: 0.6,
                                  borderRadius: 1,
                                  "&:hover": { bgcolor: "#FFF1F2", color: "#BE123C" },
                                  transition: "all 0.12s",
                                }}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(customer.id)}
                                sx={{
                                  color: "#D1D5DB",
                                  p: 0.6,
                                  borderRadius: 1,
                                  "&:hover": { bgcolor: "#FFF1F2", color: "#E11D48" },
                                  transition: "all 0.12s",
                                }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

      <AddNewCustomerDialog
               open={addCustomerOpen}
               onClose={() => setAddCustomerOpen(false)}
             />
     
      </Box>
    </ThemeProvider>
  );
}