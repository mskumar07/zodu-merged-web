import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AdjustStockModal from "@pages/InventoryScreen/AdjustStockModal";
import {
  fetchInventoryList,
  type InventoryItem,
} from "@pages/InventoryScreen/useInventoryapi";
import { useModulePermission } from "@hooks/useModulePermission";

export interface InsufficientStockInfo {
  name: string;
  /** Item code as the POS knows it (item_id / menu_id). */
  code: string;
  /** Alternate codes the inventory list may use (uuid, short menu code). */
  altCodes?: (string | null | undefined)[];
  available: number;
  requested: number;
}

interface Props {
  info: InsufficientStockInfo | null;
  onClose: () => void;
  /** Called with the item's new stock level after a successful adjustment. */
  onAdjusted: (newQty: number) => void;
}

const RED = "#D2122E";

// POS "stock check" prompt: tells the cashier the item is short, and offers to
// open the Adjust Stock modal for it (prefilled with the shortfall) instead of
// leaving the POS to fix the inventory.
export default function InsufficientStockDialog({ info, onClose, onAdjusted }: Props) {
  const { canEdit } = useModulePermission("Inventory");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null);

  // Fresh state for every new prompt.
  useEffect(() => {
    setLoading(false);
    setError(null);
    setInventoryItem(null);
  }, [info]);

  const shortfall = info ? Math.max(1, Math.ceil(info.requested - Math.max(0, info.available))) : 0;

  const handleAdjust = async () => {
    if (!info) return;
    setLoading(true);
    setError(null);
    try {
      const codes = new Set(
        [info.code, ...(info.altCodes ?? [])]
          .filter((c): c is string => !!c)
          .map((c) => c.toLowerCase())
      );
      const name = info.name.trim().toLowerCase();
      const find = (rows: InventoryItem[]) =>
        rows.find((r) => codes.has(r.item_id?.toLowerCase()) || codes.has(r.item_uuid?.toLowerCase())) ??
        rows.find((r) => r.item_name?.trim().toLowerCase() === name);

      let match: InventoryItem | undefined;
      for (const search of [info.name, info.code]) {
        const res = await fetchInventoryList({ search, limit: 50 });
        match = find(res.data ?? []);
        if (match) break;
      }
      if (!match) {
        setError("This item isn't set up in inventory yet. Add it from the Inventory screen.");
        return;
      }
      setInventoryItem(match);
    } catch {
      setError("Couldn't load the inventory for this item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={!!info && !inventoryItem}
        onClose={loading ? undefined : onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {info && (
          <DialogContent sx={{ pt: 3, pb: 1, textAlign: "center" }}>
            <Box
              sx={{
                mx: "auto",
                mb: 1.5,
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "#FDECEF",
                color: RED,
              }}
            >
              <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1d2533" }}>
              Insufficient stock
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 14, color: "#4b5563", lineHeight: 1.55 }}>
              <b>{info.name}</b> has only <b>{Math.max(0, info.available)}</b> in stock, but{" "}
              <b>{info.requested}</b> {info.requested === 1 ? "is" : "are"} needed for this bill.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 13.5, color: "#6b7280" }}>
              {canEdit
                ? "Do you want to adjust the inventory for this item now?"
                : "You don't have permission to adjust inventory."}
            </Typography>
            {error && (
              <Typography sx={{ mt: 1.5, fontSize: 13, color: RED, fontWeight: 600 }}>{error}</Typography>
            )}
          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, color: "#374151", borderColor: "#d1d5db" }}
          >
            {canEdit ? "No, cancel" : "Close"}
          </Button>
          {canEdit && (
            <Button
              fullWidth
              autoFocus
              variant="contained"
              onClick={handleAdjust}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : null}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, bgcolor: RED, "&:hover": { bgcolor: "#b00f27" } }}
            >
              Adjust Inventory
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <AdjustStockModal
        open={!!info && !!inventoryItem}
        preselectedItem={inventoryItem}
        inventoryItems={inventoryItem ? [inventoryItem] : []}
        defaultQuantity={shortfall}
        defaultReason="new_stock"
        onClose={onClose}
        onSuccess={(res) => onAdjusted(Number(res.data?.new_qty ?? 0))}
      />
    </>
  );
}
