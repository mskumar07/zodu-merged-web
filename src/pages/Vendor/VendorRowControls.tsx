import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import type { Vendor } from "../PurchaseScreen/usePuchaseapi";
import AddVendorModal from "./AddVendorDialog";
import { vendorDisplayName, type VendorRowActions } from "./useVendorRowActions";

/** Edit + delete icon pair for a vendor row inside an Autocomplete's renderOption. */
export function VendorRowActionIcons({ vendor, actions }: { vendor: Vendor; actions: VendorRowActions }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
      <Tooltip title="Edit vendor">
        <IconButton
          size="small"
          onClick={e => { e.stopPropagation(); actions.openEdit(vendor); }}
          sx={{ color: "#6B7280", p: 0.5, "&:hover": { color: "#2563EB", bgcolor: "#EFF6FF" } }}
        >
          <EditOutlinedIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete vendor">
        <IconButton
          size="small"
          onClick={e => { e.stopPropagation(); actions.requestDelete(vendor); }}
          sx={{ color: "#DC2626", p: 0.5, "&:hover": { bgcolor: "#FEF2F2" } }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

interface VendorEditDeleteDialogsProps {
  actions: VendorRowActions;
  vendorType: "Expense" | "Purchase";
}

/** The edit-vendor modal + delete-confirmation dialog — render once per screen alongside useVendorRowActions(). */
export function VendorEditDeleteDialogs({ actions, vendorType }: VendorEditDeleteDialogsProps) {
  const { editOpen, vendorToEdit, closeEdit, vendorToDelete, cancelDelete, confirmDelete, isDeleting } = actions;

  return (
    <>
      <AddVendorModal open={editOpen} onClose={closeEdit} vendorType={vendorType} vendor={vendorToEdit} onSave={closeEdit} />

      <Dialog open={!!vendorToDelete} onClose={() => !isDeleting && cancelDelete()} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: "#FEF2F2", borderRadius: 2, display: "flex" }}>
            <DeleteOutlineIcon sx={{ color: "#DC2626", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Delete Vendor</Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>This action cannot be undone</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ fontSize: 13.5, color: "#374151" }}>
            Are you sure you want to delete <strong>{vendorDisplayName(vendorToDelete)}</strong>? This will permanently remove the vendor.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <Button onClick={cancelDelete} disabled={isDeleting} sx={{ color: "#374151", fontWeight: 700, "&:hover": { bgcolor: "#F3F4F6" } }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <DeleteOutlineIcon sx={{ fontSize: 17 }} />}
            disableElevation
            sx={{ bgcolor: "#DC2626", color: "#fff", fontWeight: 700, px: 2.5, "&:hover": { bgcolor: "#B91C1C" }, "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" } }}
          >
            {isDeleting ? "Deleting…" : "Delete Vendor"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
