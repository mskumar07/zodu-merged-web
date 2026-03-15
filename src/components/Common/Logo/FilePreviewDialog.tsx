import {
  Box,
  IconButton,
  Typography,
  Chip,
  Paper,
  Dialog,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import { useState } from "react";
import FilePreviewDialog from "./FilePreviewDialog";

interface MultiFileUploadProps {
  files: File[];
  existingFiles?: Array<{ id: string; filename: string; url: string }>;
  onChange: (files: File[]) => void;
  onRemoveExisting?: (fileId: string) => void;
}

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface PreviewFile {
  type: "new" | "existing";
  file?: File;
  url?: string;
  filename: string;
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  files,
  existingFiles = [],
  onChange,
  onRemoveExisting,
}) => {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files).filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (selected.length > 0) {
      onChange([...files, ...selected]);
    }

    e.target.value = ""; // Reset input
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    onChange(updated);
  };

  const removeExistingFile = (fileId: string) => {
    if (onRemoveExisting) {
      onRemoveExisting(fileId);
    }
  };

  const getFileIcon = (filename: string, url?: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();

    if (url) {
      if (url.includes(".pdf") || url.endsWith(".pdf"))
        return <PictureAsPdfIcon color="error" fontSize="small" />;
      if (url.includes(".doc") || url.includes(".docx") || url.includes(".txt"))
        return <DescriptionIcon color="primary" fontSize="small" />;
      if (
        url.includes(".jpg") ||
        url.includes(".jpeg") ||
        url.includes(".png") ||
        url.includes(".gif")
      )
        return <ImageIcon color="success" fontSize="small" />;
    }

    if (["pdf"].includes(ext || "")) {
      return <PictureAsPdfIcon color="error" fontSize="small" />;
    }
    if (["doc", "docx", "txt"].includes(ext || "")) {
      return <DescriptionIcon color="primary" fontSize="small" />;
    }
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext || "")) {
      return <ImageIcon color="success" fontSize="small" />;
    }
    return <InsertDriveFileIcon fontSize="small" />;
  };

  const handleFilePreview = (file: File) => {
    setPreviewFile({
      type: "new",
      file,
      filename: file.name,
    });
  };

  const handleExistingFilePreview = (file: {
    id: string;
    filename: string;
    url: string;
  }) => {
    const url = file.url;
    const isImage = url.match(/\.(jpeg|jpg|png|gif|bmp)$/i) !== null;
    const isPdf = url.includes(".pdf") || url.endsWith(".pdf");

    if (isImage || isPdf) {
      setPreviewFile({
        type: "existing",
        url: file.url,
        filename: file.filename,
      });
    } else {
      // For other file types, open in new tab
      window.open(file.url, "_blank");
    }
  };

  return (
    <Box>
      {/* Upload Area */}
      <label htmlFor="file-upload-input">
        <input
          id="file-upload-input"
          type="file"
          hidden
          multiple
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
          onChange={handleSelect}
        />
        <Paper
          sx={{
            border: "2px dashed #dc2626",
            borderRadius: 2,
            p: 3,
            height: 100,
            backgroundColor: "#fff5f5",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            "&:hover": {
              backgroundColor: "#ffe5e5",
            },
          }}>
          <UploadIcon color="error" />
          <Typography color="error" variant="body2" align="center">
            Click to upload or drag and drop
          </Typography>
          <Typography color="textSecondary" variant="caption" align="center">
            JPG, PNG, PDF, DOC (Max 10MB)
          </Typography>
        </Paper>
      </label>

      {/* Existing Files Section */}
      {existingFiles.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Existing Attachments ({existingFiles.length})
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {existingFiles.map((file) => (
              <Chip
                key={file.id}
                icon={getFileIcon(file.filename, file.url)}
                label={
                  file.filename.length > 20
                    ? `${file.filename.substring(0, 20)}...`
                    : file.filename
                }
                onClick={() => handleExistingFilePreview(file)}
                onDelete={
                  onRemoveExisting
                    ? () => removeExistingFile(file.id)
                    : undefined
                }
                variant="outlined"
                sx={{
                  maxWidth: 200,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* New Files Section */}
      {files?.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            New Files to Upload ({files.length})
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {files.map((file, index) => {
              const isImage = file.type.startsWith("image");
              const isPdf = file.type === "application/pdf";

              return (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 1.5,
                    cursor: isImage || isPdf ? "pointer" : "default",
                    backgroundColor: "#fafafa",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    onClick={() =>
                      (isImage || isPdf) && handleFilePreview(file)
                    }
                    sx={{ flex: 1 }}>
                    {getFileIcon(file.name)}
                    <Box>
                      <Typography
                        sx={{
                          color: "text.primary",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}>
                        {file.name.length > 30
                          ? `${file.name.slice(0, 30)}...`
                          : file.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}>
                        {(file.size / 1024).toFixed(2)} KB •{" "}
                        {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    size="small"
                    sx={{ ml: 1 }}>
                    <DeleteIcon color="error" fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* File Preview Dialog for new files */}
      {previewFile?.type === "new" && previewFile.file && (
        <FilePreviewDialog
          file={previewFile.file}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Custom preview for existing files */}
      {previewFile?.type === "existing" && previewFile.url && (
        <Dialog
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
          maxWidth="md"
          fullWidth>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #eee",
            }}>
            <Typography fontWeight={600}>{previewFile.filename}</Typography>
            <IconButton onClick={() => setPreviewFile(null)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, textAlign: "center" }}>
            {previewFile.url.match(/\.(jpeg|jpg|png|gif|bmp)$/i) && (
              <img
                src={previewFile.url}
                alt="preview"
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              />
            )}

            {(previewFile.url.includes(".pdf") ||
              previewFile.url.endsWith(".pdf")) && (
              <iframe
                src={previewFile.url}
                width="100%"
                height="500px"
                style={{ border: "none" }}
              />
            )}

            {!previewFile.url.match(/\.(jpeg|jpg|png|gif|bmp)$/i) &&
              !(
                previewFile.url.includes(".pdf") ||
                previewFile.url.endsWith(".pdf")
              ) && (
                <Typography>
                  Preview not available.{" "}
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer">
                    Click to open
                  </a>
                </Typography>
              )}
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default MultiFileUpload;
