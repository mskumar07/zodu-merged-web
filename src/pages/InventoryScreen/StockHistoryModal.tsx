import {
  Dialog,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  Select,
  MenuItem
} from "@mui/material";
import { useState, useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useStockHistory } from "./useInventoryApi";

export default function StockHistoryModal({ open, onClose, item }: any) {
  const { data, isLoading } = useStockHistory(item?.item_uuid);


  const currentStock = data?.summary?.current_stock || 0;

  // 🎯 Filter States
  const [selectedType, setSelectedType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // 🎯 Filter Logic
  const filteredRows = useMemo(() => {
    const rows = data?.data || [];
    return rows.filter((row: any) => {
      // Filter by type
      if (selectedType && row.transaction_type?.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // Filter by date range
      const rowDate = new Date(row.created_at).toISOString().split("T")[0];
      if (fromDate && rowDate < fromDate) {
        return false;
      }
      if (toDate && rowDate > toDate) {
        return false;
      }

      return true;
    });
  }, [data, selectedType, fromDate, toDate]);

  // 🎯 Type config
  const getTypeConfig = (type: string) => {
    switch (type?.toLowerCase()) {
      case "purchase":
        return { color: "#16a34a", bg: "#ecfdf5", icon: <AddCircleIcon sx={{ fontSize: 14 }} /> };
      case "sale":
        return { color: "#dc2626", bg: "#fef2f2", icon: <RemoveCircleIcon sx={{ fontSize: 14 }} /> };
      case "wastage":
        return { color: "#ea580c", bg: "#fff7ed", icon: <DeleteIcon sx={{ fontSize: 14 }} /> };
      case "return":
        return { color: "#2563eb", bg: "#eff6ff", icon: <KeyboardReturnIcon sx={{ fontSize: 14 }} /> };
      default:
        return { color: "#6b7280", bg: "#f3f4f6", icon: null };
    }
  };
const getInitials = (name: string = "") => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};
  // 📅 Format
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });


  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>

      <Box sx={{ borderRadius: 3, overflow: "hidden", }}>

        {/* HEADER */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 1,
          borderBottom: "1px solid #E5E7EB"
        }}>
          <Typography fontWeight={700} fontSize={16}>
            Inventory Details
          </Typography>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* CONTENT */}
        <Box sx={{ p: 3 }}>

          {/* TOP */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>

            {/* LEFT */}
            <Box sx={{ display: "flex", gap: 2 }}>
             <Box
  sx={{
    width: 70,
    height: 70,
    borderRadius: 2,
    overflow: "hidden",
    border: "1px solid #E5E7EB",
    bgcolor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
  {item?.image ? (
    <img
      src={item.image}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <Typography
      sx={{
        fontSize: 20,
        fontWeight: 700,
        color: "#6B7280"
      }}
    >
      {getInitials(item?.item_name)}
    </Typography>
  )}
</Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#b91c1c",
                    bgcolor: "#fef2f2",
                    px: 1,
                    py: "2px",
                    borderRadius: "6px",
                    display: "inline-block",
                    mb: 0.5
                  }}
                >
                  SKU: {item?.item_id || "N/A"}
                </Typography>

                <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                  {item?.item_name}
                </Typography>
              </Box>
            </Box>

            {/* RIGHT */}
            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                px: 3,
                py: 1,
                bgcolor: "#F9FAFB",
                minWidth: 180
              }}
            >
              <Typography sx={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>
                CURRENT STOCK
              </Typography>

              <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                {Number(currentStock).toFixed(2)}
                <Typography component="span" sx={{ fontSize: 12, color: "#6B7280", ml: 0.5 }}>
                  {item?.unit_short_name || "units"}
                </Typography>
              </Typography>
            </Box>

          </Box>

          {/* FILTER */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 1.5, alignItems: "center" }}>
            {/* Type Filter */}
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              displayEmpty
              sx={{
                fontSize: 14,
                height: 34,
                borderRadius: "8px",
                minWidth: 140,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E5E7EB"
                }
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="purchase">Purchase</MenuItem>
              <MenuItem value="sale">Sale</MenuItem>
              <MenuItem value="wastage">Wastage</MenuItem>
              <MenuItem value="return">Return</MenuItem>
            </Select>

            <Typography fontSize={14}>From</Typography>
            <TextField
              size="medium"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  height: 34,
                  fontSize: 14,
                  borderRadius: "8px"
                }
              }}
            />
            <Typography fontSize={14}>to</Typography>
            <TextField
              size="medium"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  height: 34,
                  fontSize: 14,
                  borderRadius: "8px"
                }
              }}
            />
          </Box>

          {/* TABLE HEADER */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "2.2fr 1.2fr 2fr 1fr 1fr",
            px: 2,
            py: 1,
            fontSize: 14,
            fontWeight: 700,
            color: "#6B7280",
            bgcolor: "#F9FAFB",
            borderRadius: "5px 5px 0 0",
            border: "1px solid #E5E7EB"
          }}>
            <span>Date & Time</span>
            <span>Type</span>
            <span>Reference ID</span>
            <span style={{ textAlign: "right" }}>Qty Change</span>
            <span style={{ textAlign: "right" }}>Final Stock</span>
          </Box>

          {/* TABLE BODY */}
          <Box sx={{
            maxHeight: 400,
            overflowY: "auto",
            borderRadius: "0 0 5px 5px",
            border: "1px solid #E5E7EB",
            borderTop: "none"
          }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : filteredRows.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <Typography color="#9CA3AF" fontSize={14}>
                  No records found
                </Typography>
              </Box>
            ) : (
              filteredRows.map((r: any) => {
                const type = getTypeConfig(r.transaction_type);

                return (
                  <Box
                    key={r.ledger_id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "2.2fr 1.2fr 2fr 1fr 1fr",
                      px: 2,
                      py: 1,
                      borderBottom: "1px solid #F1F5F9",
                      alignItems: "center",
                      fontSize: 13,
                      "&:hover": { bgcolor: "#FAFAFA" }
                    }}
                  >
                    {/* DATE */}
                    <Box>
                      <Typography fontSize={13} fontWeight={600}>
                        {formatDate(r.created_at)}
                      </Typography>
                      <Typography fontSize={11} color="#9CA3AF">
                        {formatTime(r.created_at)}
                      </Typography>
                    </Box>

                    {/* TYPE */}
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: "2px",
                        borderRadius: "999px",
                        fontSize: 10,
                        fontWeight: 700,
                        bgcolor: type.bg,
                        color: type.color,
                        width: "fit-content"
                      }}
                    >
                      {type.icon}
                      {r.transaction_type?.toUpperCase()}
                    </Box>

                    {/* REF */}
                    <Typography fontSize={13} fontFamily="monospace">
                      {r.reference_id || "-"}
                    </Typography>

                    {/* QTY */}
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: "right",
                        color: Number(r.qty_change) > 0 ? "#16a34a" : "#dc2626"
                      }}
                    >
                      {Number(r.qty_change) > 0 ? "+" : ""}
                      {Number(r.qty_change).toFixed(2)} {item.unit_short_name || "units"}
                    </Typography>

                    {/* FINAL */}
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: "right",
                        color: "#111827"
                      }}
                    >
                      {Number(r.stock_after).toFixed(2)} {item.unit_short_name || "units"}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>

          {/* FOOTER */}
          {/* <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Box
              onClick={onClose}
              sx={{
                bgcolor: "#dc2626",
                color: "#fff",
                px: 3,
                py: 1,
                borderRadius: "999px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                "&:hover": { bgcolor: "#b91c1c" }
              }}
            >
              Close
            </Box>
          </Box> */}

        </Box>
      </Box>
    </Dialog>
  );
}