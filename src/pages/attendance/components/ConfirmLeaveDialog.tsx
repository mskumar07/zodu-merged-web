import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";

interface Props {
  open: boolean;
  action?: "APPROVE" | "REJECT";
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmLeaveDialog: React.FC<Props> = ({
  open,
  action,
  loading,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogContent>
        Are you sure you want to {action?.toLowerCase()} this leave request?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color={action === "APPROVE" ? "success" : "error"}
          disabled={loading}
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmLeaveDialog;
