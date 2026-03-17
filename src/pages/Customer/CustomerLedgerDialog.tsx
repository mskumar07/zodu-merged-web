import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

interface LedgerRow {
  date: string;
  invoice: string;
  description: string;
  total: number;
  paid: number;
  balance: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  customerName: string;
}

const MOCK_DATA: LedgerRow[] = [
  {
    date: "10/27/2023",
    invoice: "INV-8842",
    description: "POS Sale - Items (2)",
    total: 1100,
    paid: 1100,
    balance: 0,
  },
  {
    date: "10/15/2023",
    invoice: "INV-8710",
    description: "POS Sale - Coffee Beans Bulk",
    total: 8500,
    paid: 4250,
    balance: 4250,
  },
  {
    date: "09/28/2023",
    invoice: "INV-8211",
    description: "Service Fee",
    total: 2850,
    paid: 2850,
    balance: 0,
  },
];

const INR = (v: number) =>
  `₹ ${v.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const filterInputSx = {
  "& .MuiOutlinedInput-root": {
    height: 34,
    borderRadius: "6px",
    fontSize: 12,
    backgroundColor: "#F9FBFD",
    "& fieldset": { borderColor: "#E2E8F0" },
  },
};

function SummaryCard({
  label,
  value,
  color,
  highlight = false,
}: {
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "10px",
        border: highlight ? "2px solid #EF4444" : "1px solid #E6EDF5",
        px: 2.5,
        py: 2,
        boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748B",
          mb: 0.7,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 900,
          color,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default function CustomerLedgerDialog({
  open,
  onClose,
  customerName,
}: Props) {
  const totalInvoiced = MOCK_DATA.reduce((s, r) => s + r.total, 0);
  const totalPaid = MOCK_DATA.reduce((s, r) => s + r.paid, 0);
  const pending = totalInvoiced - totalPaid;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: { xs: "calc(100% - 24px)", sm: "calc(100% - 38px)" },
            maxWidth: { xs: "100%", md: "1200px" },
            m: { xs: 1.5, sm: 3 },
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(15,23,42,0.2)",
          },
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          px: { xs: 2, sm: 3 },
          py: { xs: 1.75, sm: 2.2 },
          borderBottom: "1px solid #EEF2F7",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{ width: 6, height: 26, bgcolor: "#EF3125", borderRadius: 1 }} />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 14, sm: 16 }, lineHeight: 1.25 }}>
            Customer Payment Ledger -
            <span style={{ color: "#EF3125", marginLeft: 6 }}>
              {customerName}
            </span>
          </Typography>
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          backgroundColor: "#fff",
        }}
      >
        {/* SUMMARY */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 1.5, sm: 2, md: 2.5 },
            my: { xs: 2.5, sm: 3, md: 4 },
          }}
        >
          <SummaryCard
            label="TOTAL INVOICED"
            value={INR(totalInvoiced)}
            color="#1E293B"
          />
          <SummaryCard
            label="TOTAL PAID"
            value={INR(totalPaid)}
            color="#16A34A"
          />
          <SummaryCard
            label="PENDING BALANCE"
            value={INR(pending)}
            color="#EF3125"
            highlight
          />
        </Box>

        {/* FILTER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "#334155",
            }}
          >
            TRANSACTION HISTORY
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              ml: "auto",
              flexShrink: 0,
            }}
          >
            <Select size="small" defaultValue="all" sx={{ ...filterInputSx, width: 120, height: 34, flexShrink: 0 }}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>

            <TextField
              size="small"
              placeholder="mm/dd/yyyy"
              sx={{ ...filterInputSx, width: 140, flexShrink: 0 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748B", flexShrink: 0 }}>
              TO
            </Typography>

            <TextField
              size="small"
              placeholder="mm/dd/yyyy"
              sx={{ ...filterInputSx, width: 140, flexShrink: 0 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              size="small"
              placeholder="Search Invoice ID..."
              sx={{ ...filterInputSx, width: 220, flexShrink: 0 }}
            />
          </Box>
        </Box>

        {/* TABLE */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "10px",
            border: "1px solid #E6EDF5",
            overflow: "hidden",
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: "#F1F5F9",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#475569",
                    py: 1.3,
                    px: 1.5,
                  },
                }}
              >
                <TableCell>Date</TableCell>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Total (₹)</TableCell>
                <TableCell align="right">Paid (₹)</TableCell>
                <TableCell align="right">Balance (₹)</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {MOCK_DATA.map((row) => (
                <TableRow
                  key={row.invoice}
                  sx={{
                    "& td": {
                      borderBottom: "1px solid #F1F5F9",
                      px: 1.5,
                      py: 1.4,
                      fontSize: 12,
                    },
                  }}
                >
                  <TableCell sx={{ color: "#64748B" }}>{row.date}</TableCell>
                  <TableCell
                    sx={{
                      color: "#3B82F6",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    #{row.invoice}
                  </TableCell>
                  <TableCell sx={{ color: "#64748B" }}>{row.description}</TableCell>
                  <TableCell align="right" sx={{ color: "#111827", fontWeight: 600 }}>
                    {INR(row.total)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#22C55E", fontWeight: 500 }}>
                    {INR(row.paid)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: row.balance ? "#FF3B30" : "#111827",
                      fontWeight: 800,
                    }}
                  >
                    {INR(row.balance)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" sx={{ color: "#FF3B30" }}>
                      <VisibilityOutlinedIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </Box>
        </Paper>
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          py: { xs: 1.75, sm: 2 },
          borderTop: "1px solid #E6EDF5",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography
          fontSize={12}
          color="#64748B"
          sx={{
            flex: 1,
            minWidth: 0,
            lineHeight: 1.4,
            pr: { xs: 0, sm: 2 },
          }}
        >
          Showing last 12 months of transaction history for {customerName}.
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "flex-end",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.25, sm: 3 },
            width: { xs: "100%", sm: "auto" },
            flexShrink: 0,
          }}
        >
          <Box sx={{ textAlign: { xs: "left", sm: "right" }, minWidth: { sm: 120 } }}>
            <Typography fontSize={10} color="#64748B" sx={{ lineHeight: 1.1 }}>
              TOTAL OUTSTANDING
            </Typography>
            <Typography fontSize={18} fontWeight={900} color="#EF3125" sx={{ lineHeight: 1.15, mt: 0.25 }}>
              {INR(pending)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<PrintOutlinedIcon />}
            sx={{
              height: 40,
              minWidth: 196,
              width: { xs: "100%", sm: "auto" },
              borderRadius: "8px",
              px: 3,
              bgcolor: "#EF3125",
              whiteSpace: "nowrap",
              fontWeight: 800,
              boxShadow: "0 6px 16px rgba(239,49,37,0.3)",
              "&:hover": { bgcolor: "#D92D20" },
            }}
          >
            PRINT LEDGER [F12]
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
