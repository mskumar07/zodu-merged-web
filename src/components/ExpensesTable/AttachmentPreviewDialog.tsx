// @components/Attachments/AttachmentPreviewDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Attachment {
  filename: string;
  url: string;
}

interface AttachmentPreviewDialogProps {
  open: boolean;
  file: Attachment | null;
  onClose: () => void;
  isImage: (filename: string) => boolean;
}

const AttachmentPreviewDialog: React.FC<AttachmentPreviewDialogProps> = ({
  open,
  file,
  onClose,
  isImage,
}) => {
  if (!file) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.05)",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.1)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        {isImage(file.filename) ? (
          <img
            src={file.url}
            alt={file.filename}
            style={{ width: "100%", borderRadius: 8 }}
          />
        ) : (
          <iframe
            src={file.url}
            title="File Preview"
            width="100%"
            height="500px"
            style={{ border: "none" }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentPreviewDialog;
