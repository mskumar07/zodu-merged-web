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
import DataTable from "@utils/DataTable";


export default function StockHistoryModal({ open, onClose, item }: any) {
  const { data, isLoading } = useStockHistory(item?.item_uuid);

  const currentStock = data?.summary?.current_stock || 0;
  const itemDetails = data?.item || item;

  const [selectedType, setSelectedType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      const cleanedDate = dateStr.replace(",", "").trim();
      const parsed = new Date(cleanedDate);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  };

  const filteredRows = useMemo(() => {
    const rows = Array.isArray(data?.data) ? data.data : [];

    return rows.filter((row: any) => {
      if (!row.created_at) return false;

      if (
        selectedType &&
        row.transaction_type?.toLowerCase() !== selectedType.toLowerCase()
      ) {
        return false;
      }

      const rowDate = parseDate(row.created_at);
      if (!rowDate) return false;

      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from && rowDate < from) return false;
      if (to && rowDate > to) return false;

      return true;
    });
  }, [data?.data, selectedType, fromDate, toDate]);

  const getTypeConfig = (type: string) => {
    const typeMap: Record<
      string,
      { color: string; bg: string; icon: JSX.Element }
    > = {
      purchase: {
        color: "#16a34a",
        bg: "#ecfdf5",
        icon: <AddCircleIcon sx={{ fontSize: 14 }} />
      },
      sale: {
        color: "#dc2626",
        bg: "#fef2f2",
        icon: <RemoveCircleIcon sx={{ fontSize: 14 }} />
      },
      wastage: {
        color: "#ea580c",
        bg: "#fff7ed",
        icon: <DeleteIcon sx={{ fontSize: 14 }} />
      },
      return: {
        color: "#2563eb",
        bg: "#eff6ff",
        icon: <KeyboardReturnIcon sx={{ fontSize: 14 }} />
      }
    };

    return (
      typeMap[type?.toLowerCase()] || {
        color: "#6b7280",
        bg: "#f3f4f6",
        icon: null
      }
    );
  };

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date: string) => {
    const parsed = parseDate(date);
    if (!parsed) return "Invalid date";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  };

  const formatTime = (date: string) => {
    const parsed = parseDate(date);
    if (!parsed) return "Invalid time";
    return parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const handleResetFilters = () => {
    setSelectedType("");
    setFromDate("");
    setToDate("");
  };

  const hasActiveFilters = selectedType || fromDate || toDate;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Box sx={{ borderRadius: 3, overflow: "hidden" }}>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 1,
            borderBottom: "1px solid #E5E7EB"
          }}
        >
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 2,
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
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                    {getInitials(itemDetails?.item_name)}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 700,color:"#b91c1c", bgcolor:"#fef2f2", px:1, py:"2px", borderRadius:"6px", display:"inline-block", mb:0.5 }}>
                  SKU: {itemDetails?.item_id}
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                  {itemDetails?.item_name}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                px: 3,
                py: 1
              }}
            >
              <Typography sx={{ fontSize: 10 }}>
                CURRENT STOCK
              </Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                {Number(currentStock).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* FILTER */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1.5,
              alignItems: "center"
            }}
          >
            <Box />

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {/* <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="purchase">Purchase</MenuItem>
                <MenuItem value="sale">Sale</MenuItem>
                <MenuItem value="wastage">Wastage</MenuItem>
                <MenuItem value="return">Return</MenuItem>
              </Select> */}

              {/* <Typography>From</Typography> */}
              <TextField
                type="date"
                size="small"
                value={fromDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (toDate && val > toDate) setToDate("");
                  setFromDate(val);
                }}
                inputProps={{ max: toDate || undefined }}
              />

              <Typography>to</Typography>
              <TextField
                type="date"
                size="small"
                value={toDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (fromDate && val < fromDate) return;
                  setToDate(val);
                }}
                inputProps={{ min: fromDate || undefined }}
              />

              {hasActiveFilters && (
                <Box onClick={handleResetFilters} sx={{ cursor: "pointer" }}>
                <CloseIcon fontSize="small"  color="primary"/>
                </Box>
              )}
            </Box>
          </Box>

          {/* TABLE */}
          <DataTable
            columns={[
              {
                label: "Date & Time",
                key: "date",
                width: "2.2fr",
                render: (r) => (
                  <Box>
                    <Typography fontSize={13} fontWeight={600}>
                      {formatDate(r.created_at)}
                    </Typography>
                    <Typography fontSize={11} color="#9CA3AF">
                      {formatTime(r.created_at)}
                    </Typography>
                  </Box>
                )
              },
              {
                label: "Type",
                key: "type",
                width: "1.3fr",
                align: "left",
                render: (r) => {
                  const type = getTypeConfig(r.transaction_type);
                  return (
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
                  );
                }
              },
              {
                label: "Reference ID",
                key: "reference",
                width: "2fr",
                render: (r) => r.reference_id || "-"
              },
              {
                label: "Qty Change",
                key: "qty",
                width: "1.3fr",
                align: "right",
                render: (r) => (
                  <Typography
                    sx={{
                      color: Number(r.qty_change) > 0 ? "#16a34a" : "#dc2626",
                      fontWeight: 600
                    }}
                  >
                    {Number(r.qty_change) > 0 ? "+" : ""}
                    {Number(r.qty_change).toFixed(2)}
                  </Typography>
                )
              },
              {
                label: "Final Stock",
                key: "final",
                width: "1fr",
                align: "right",
                render: (r) => Number(r.stock_after).toFixed(2)
              }
            ]}
            rows={filteredRows}
            rowKey={(r) => r.ledger_id}
            isLoading={isLoading}
            emptyMessage="No records match the selected filters"
            maxHeight={400}
          />
        </Box>
      </Box>
    </Dialog>
  );
}