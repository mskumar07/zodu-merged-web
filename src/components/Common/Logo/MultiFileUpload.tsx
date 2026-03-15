import {
  Box,
  IconButton,
  Typography,
  Paper,
  Dialog,
  Button,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import { useState, useEffect } from "react";
import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";
import { toast } from "react-toastify";

interface AttachmentFile {
  id: string;
  fileName: string; // Changed to only filename (lowercase)
  url: string | any;
}

interface MultiFileUploadProps {
  files: File[];
  existingFiles?: AttachmentFile[]|[];
  onChange: (files: File[]) => void;
  onRemoveExisting?: (fileName: string) => void;
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
  filename: string; // Changed to filename
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  files = [],
  existingFiles = [],
  onChange,
  onRemoveExisting,
}) => {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const removeFile = async (index: number, fileName: string) => {
    const updated = [...files];
    updated.splice(index, 1);
    try {
      await axiosInstance.delete(apiConfig.deleteImage(fileName));
      toast.success("Attachment deleted");
    } catch (error) {
      toast.error("Failed to delete from server, but removed locally");
      console.error("Delete error:", error);
    }
    onChange(updated);
  };

  const removeExistingFile = (fileName: string) => {
    if (onRemoveExisting) {
      onRemoveExisting(fileName);
    }
  };

  const getFileIcon = (filename: string, url?: string | any) => {
    const ext = filename?.split(".").pop()?.toLowerCase();

    // Check if url is a string and contains specific extensions
    if (url && typeof url === "string") {
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

    // Fallback to file extension
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

  // Helper to get safe URL string
  const getSafeUrl = (file: AttachmentFile): string => {
    if (!file.url) return "";

    // If url is already a string, return it
    if (typeof file.url === "string") {
      // Ensure it's a valid URL
      if (
        file.url.startsWith("http://") ||
        file.url.startsWith("https://") ||
        file.url.startsWith("data:")
      ) {
        return file.url;
      }
      // If it's a relative path, make it absolute
      if (file.url.startsWith("/")) {
        return window.location.origin + file.url;
      }
      return file.url;
    }

    // If url is an object, try to extract the URL
    if (file.url && typeof file.url === "object") {
      if (file.url.url && typeof file.url.url === "string") return file.url.url;
      if (file.url.path && typeof file.url.path === "string")
        return file.url.path;
      if (file.url.location && typeof file.url.location === "string")
        return file.url.location;
      if (file.url.publicUrl && typeof file.url.publicUrl === "string")
        return file.url.publicUrl;
      if (file.url.secure_url && typeof file.url.secure_url === "string")
        return file.url.secure_url;

      // Try to stringify and parse
      try {
        const urlString = JSON.stringify(file.url);
        if (urlString.includes("http")) {
          // Extract URL from stringified object
          const urlMatch = urlString.match(/(https?:\/\/[^"']+)/);
          if (urlMatch) return urlMatch[0];
        }
      } catch (error) {
        console.error("Error parsing URL object:", error);
      }
    }

    return "";
  };

  // Helper to get file size text
  const getFileSizeText = (file: AttachmentFile): string => {
    const url = getSafeUrl(file);
    if (url) {
      const ext = file.fileName?.split(".").pop()?.toLowerCase() || "";
      const type =
        ext === "pdf"
          ? "PDF"
          : ["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)
          ? "IMAGE"
          : ["doc", "docx", "txt"].includes(ext)
          ? "DOC"
          : "FILE";
      return `${type}`;
    }
    return "FILE";
  };

  // Helper to check if a file is an image
  const isFileImage = (filename: string): boolean => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext || "");
  };

  // Helper to check if a file is a PDF
  const isFilePdf = (filename: string): boolean => {
    const ext = filename?.split(".")?.pop()?.toLowerCase();
    return ext === "pdf";
  };

  const handleFilePreview = (file: File) => {
    setPreviewFile({
      type: "new",
      file,
      filename: file.name,
    });
    setImageError(false);
    setImageLoading(false);
  };

  const handleExistingFilePreview = (file: AttachmentFile) => {
    const url = getSafeUrl(file);

    if (!url) {
      console.warn("No valid URL found for file:", file);
      return;
    }

    setPreviewFile({
      type: "existing",
      url: url,
      filename: file.fileName,
    });
    setImageError(false);
    setImageLoading(true);
  };

  // Reset image states when preview changes
  useEffect(() => {
    if (previewFile) {
      setImageLoading(false);
      setImageError(false);
    }
  }, [previewFile]);

  // Filter out invalid existing files
  const validExistingFiles = existingFiles.filter((file) => {
    const url = getSafeUrl(file);
    return file && file.id && file.fileName && url;
  });

  // COMMON PREVIEW DIALOG
  const renderPreviewDialog = () => {
    if (!previewFile) return null;

    // Use helper functions to determine file type
    const isImage = isFileImage(previewFile.filename);
    const isPdf = isFilePdf(previewFile.filename);

    return (
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
          },
        }}>
        {/* Dialog Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
            bgcolor: "#fafafa",
          }}>
          <Typography
            variant="h6"
            fontWeight={600}
            noWrap
            sx={{ maxWidth: "80%" }}>
            {previewFile.filename}
          </Typography>
          <IconButton onClick={() => setPreviewFile(null)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Dialog Content */}
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          {isImage ? (
            // IMAGE PREVIEW - FOR BOTH NEW AND EXISTING
            <Box sx={{ width: "100%" }}>
              {imageLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress />
                  {previewFile.type === "existing" && (
                    <Typography sx={{ ml: 2 }}>Loading image...</Typography>
                  )}
                </Box>
              )}

              {!imageLoading && !imageError && (
                <>
                  {previewFile.type === "new" ? (
                    // NEW FILE IMAGE
                    <img
                      src={
                        previewFile.file
                          ? URL.createObjectURL(previewFile.file)
                          : ""
                      }
                      alt="preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "70vh",
                        borderRadius: "4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      onLoad={() => {
                        setImageLoading(false);
                        setImageError(false);
                      }}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  ) : (
                    // EXISTING FILE IMAGE
                    <img
                      src={previewFile.url}
                      alt="preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "70vh",
                        borderRadius: "4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      onLoad={() => {
                        console.log(
                          "✅ Image loaded successfully:",
                          previewFile.url
                        );
                        setImageLoading(false);
                        setImageError(false);
                      }}
                      onError={(e) => {
                        console.error(
                          "❌ Image failed to load:",
                          previewFile.url
                        );
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  )}
                </>
              )}

              {imageError && (
                <Box sx={{ p: 3 }}>
                  <ImageIcon
                    sx={{ fontSize: 60, color: "error.main", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Unable to load image
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    The image could not be loaded. It might be corrupted or the
                    URL is invalid.
                  </Typography>
                  {previewFile.url && (
                    <Button
                      variant="contained"
                      onClick={() => window.open(previewFile.url!, "_blank")}
                      sx={{
                        bgcolor: "#dc2626",
                        "&:hover": { bgcolor: "#b91c1c" },
                      }}>
                      Open Image in New Tab
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          ) : isPdf ? (
            // PDF PREVIEW
            <Box sx={{ p: 3 }}>
              <PictureAsPdfIcon
                sx={{ fontSize: 60, color: "error.main", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                PDF Preview
              </Typography>
              <Typography color="text.secondary" paragraph>
                {previewFile.type === "new"
                  ? "PDF files cannot be previewed directly in the browser."
                  : "Click the button below to view or download the PDF file."}
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  if (previewFile.type === "new") {
                    const url = URL.createObjectURL(previewFile.file!);
                    window.open(url, "_blank");
                  } else {
                    window.open(previewFile.url!, "_blank");
                  }
                }}
                sx={{
                  bgcolor: "#dc2626",
                  "&:hover": { bgcolor: "#b91c1c" },
                }}>
                {previewFile.type === "new" ? "Download PDF" : "View PDF"}
              </Button>
            </Box>
          ) : (
            // OTHER FILE TYPES
            <Box sx={{ p: 3 }}>
              <InsertDriveFileIcon
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                File Preview
              </Typography>
              <Typography color="text.secondary" paragraph>
                Preview not available for this file type. Please download the
                file to view its contents.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  if (previewFile.type === "new") {
                    const url = URL.createObjectURL(previewFile.file!);
                    window.open(url, "_blank");
                  } else {
                    window.open(previewFile.url!, "_blank");
                  }
                }}
                sx={{
                  bgcolor: "#dc2626",
                  "&:hover": { bgcolor: "#b91c1c" },
                }}>
                Download File
              </Button>
            </Box>
          )}
        </Box>
      </Dialog>
    );
  };

  return (
    <Box sx={{mt:2, mb:2}}>
      {/* Upload Area */}
      <label
        htmlFor="file-upload-input"
        style={{ width: "100%", display: "block" }}>
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

      {/* Combined Files Section */}
      {(validExistingFiles.length > 0 || files.length > 0) && (
        <Box mt={3}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Attachments ({validExistingFiles.length + files.length})
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {/* Existing Files */}
            {validExistingFiles.map((file) => {
              const url = getSafeUrl(file);
              const filename = file.fileName;
              const isImageFile = isFileImage(filename);
              const isPdfFile = isFilePdf(filename);

              return (
                <Box
                  key={file.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 1.5,
                    cursor: "pointer",
                    backgroundColor: "#fafafa",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    onClick={() => handleExistingFilePreview(file)}
                    sx={{ flex: 1 }}>
                    {getFileIcon(filename, url)}
                    <Box>
                      <Typography
                        sx={{
                          color: "text.primary",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}>
                        {filename.length > 30
                          ? `${filename.slice(0, 30)}...`
                          : filename}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}>
                        Existing • {getFileSizeText(file)}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingFile(file.fileName);
                    }}
                    size="small"
                    sx={{ ml: 1 }}>
                    <DeleteIcon color="error" fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}

            {/* New Files */}
            {files.map((file, index) => {
              // const isImage = file.type.startsWith("image");
              // const isPdf = file.type === "application/pdf";

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
                    cursor: "pointer",
                    backgroundColor: "#fafafa",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    onClick={() => handleFilePreview(file)}
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

                      removeFile(index, file.name);
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

      {/* Render the common preview dialog */}
      {renderPreviewDialog()}
    </Box>
  );
};

export default MultiFileUpload;
