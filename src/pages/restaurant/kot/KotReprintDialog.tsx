import { useState } from "react";
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogContent, IconButton, Tooltip, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { closeFromControlsOnly } from "@utils/dialog";
import { itemLabel, type KotBatch, type KotTicket } from "@utils/kot/kotTicket";
import { fetchKotTickets } from "@pages/MenuItemScreen/kotApi";
import { useKotPrinting } from "./useKotPrinting";

const RED = "#d32f2f";
const NAVY = "#1e2a5e";

interface Props {
  open: boolean;
  onClose: () => void;
  apiOrderId: string | null;
  zoduId: string;
  branchId: string;
  restaurantName: string;
  onResult: (message: string, severity: "success" | "error") => void;
}

const TYPE_CHIP: Record<KotTicket["kot_type"], { bg: string; fg: string }> = {
  NEW: { bg: "#ecfdf5", fg: "#047857" },
  ADD: { bg: "#eff6ff", fg: "#1d4ed8" },
  CANCEL: { bg: "#fef2f2", fg: "#b91c1c" },
};

function statusChip(status: KotTicket["print_status"]) {
  if (status === "success" || status === "reprinted") {
    return <Chip size="small" label={status === "reprinted" ? "Reprinted" : "Printed"} sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: "#ecfdf5", color: "#047857" }} />;
  }
  if (status === "failed") {
    return <Chip size="small" label="Not printed" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: "#fef2f2", color: "#b91c1c" }} />;
  }
  return <Chip size="small" label="Unconfirmed" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: "#f3f4f6", color: "#6b7280" }} />;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

/** Every KOT an order produced, per send and per counter, with reprint. */
export default function KotReprintDialog({ open, onClose, apiOrderId, zoduId, branchId, restaurantName, onResult }: Props) {
  const qc = useQueryClient();
  const { printBatch } = useKotPrinting(zoduId, branchId, restaurantName);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const queryKey = ["kot", "tickets", zoduId, branchId, apiOrderId];
  const { data: batches = [], isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchKotTickets(zoduId, branchId, apiOrderId!),
    enabled: open && !!apiOrderId,
    staleTime: 0,
  });

  const reprint = async (batch: KotBatch, ticketIds: number[], key: string) => {
    setBusyKey(key);
    try {
      const { error } = await printBatch(batch, { reprint: true, ticketIds });
      if (error) onResult(error, "error");
      else onResult(ticketIds.length === 1 ? "KOT reprinted" : `KOT #${batch.kot_no} reprinted`, "success");
      qc.invalidateQueries({ queryKey });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closeFromControlsOnly(onClose)}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: "85vh" } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 2, borderBottom: "1px solid #eef0f3" }}>
        <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: `${RED}14`, color: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: 16 }}>Kitchen tickets</Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Reprint a counter's KOT, or a whole send</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress size={24} sx={{ color: RED }} /></Box>
        )}
        {isError && <Typography sx={{ color: "#b91c1c", fontSize: 13, py: 3, textAlign: "center" }}>Could not load kitchen tickets.</Typography>}
        {!isLoading && !isError && batches.length === 0 && (
          <Typography sx={{ color: "#9ca3af", fontSize: 13, py: 4, textAlign: "center" }}>No kitchen tickets for this order yet.</Typography>
        )}

        {batches.map((batch) => {
          const batchKey = `batch-${batch.kot_no}-${batch.tickets[0]?.ticket_id}`;
          return (
            <Box key={batchKey} sx={{ mb: 2, border: "1px solid #eef0f3", borderRadius: 2, overflow: "hidden" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "#fafbfc", borderBottom: "1px solid #eef0f3" }}>
                <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: 14 }}>KOT #{batch.kot_no}</Typography>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  {batch.tickets[0] ? formatTime(batch.tickets[0].created_at) : ""}
                  {batch.table_no ? ` · Table ${batch.table_no}` : batch.order_no ? ` · ${batch.order_no}` : ""}
                </Typography>
                <Box sx={{ flex: 1 }} />
                {batch.tickets.length > 1 && (
                  <Button
                    size="small"
                    onClick={() => reprint(batch, batch.tickets.map((t) => t.ticket_id), batchKey)}
                    disabled={busyKey !== null}
                    startIcon={busyKey === batchKey ? <CircularProgress size={13} color="inherit" /> : <PrintOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, color: RED }}
                  >
                    Reprint all
                  </Button>
                )}
              </Box>

              {batch.tickets.map((ticket) => {
                const key = `ticket-${ticket.ticket_id}`;
                return (
                  <Box key={key} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, px: 2, py: 1.25, "&:not(:last-child)": { borderBottom: "1px dashed #eef0f3" } }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{ticket.counter_name || "Billing counter"}</Typography>
                        <Chip size="small" label={ticket.kot_type} sx={{ height: 20, fontSize: 11, fontWeight: 800, bgcolor: TYPE_CHIP[ticket.kot_type].bg, color: TYPE_CHIP[ticket.kot_type].fg }} />
                        {statusChip(ticket.print_status)}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
                        {ticket.items.map((i) => `${itemLabel(i)} × ${i.qty}`).join(", ")}
                      </Typography>
                    </Box>
                    <Tooltip title="Reprint this ticket">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => reprint(batch, [ticket.ticket_id], key)}
                          disabled={busyKey !== null}
                          sx={{ color: RED, bgcolor: `${RED}0f`, borderRadius: "8px", "&:hover": { bgcolor: `${RED}1f` } }}
                        >
                          {busyKey === key ? <CircularProgress size={16} color="inherit" /> : <PrintOutlinedIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}
