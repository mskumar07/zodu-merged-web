// @components/Attachments/AttachmentViewer.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { getFileType } from "@utils/util";
import AttachmentPreviewDialog from "./AttachmentPreviewDialog";

interface Attachment {
  id: string;
  filename: string;
  url: string;
  type?: string;
}

interface AttachmentViewerProps {
  attachments: Attachment[];
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({ attachments }) => {
  const [preview, setPreview] = useState<Attachment | null>(null);

  const isFileImage = (filename: string): boolean => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext || "");
  };

  const handleClick = (file: Attachment) => {
    if (isFileImage(file.filename)) {
      setPreview(file);
    } else {
      window.open(file.url, "_blank");
    }
  };

  return (
    <>
      <Box display="flex" gap={2} flexWrap="wrap">
        {attachments.length ? (
          attachments.map((file, index) => {
            const type = getFileType(file);

            return (
              <Box
                key={file.id || index}
                onClick={() => handleClick(file)}
                sx={{
                  width: 100,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    backgroundColor: "#fafafa",
                    "&:hover": {
                      borderColor: "#1976d2",
                      backgroundColor: "#f0f7ff",
                    },
                  }}
                >
                  {isFileImage(file.filename) ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : type === "pdf" ? (
                    <PictureAsPdfIcon color="error" fontSize="large" />
                  ) : type === "doc" ? (
                    <DescriptionIcon color="primary" fontSize="large" />
                  ) : (
                    <InsertDriveFileIcon fontSize="large" />
                  )}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {file.filename || `Attachment ${index + 1}`}
                </Typography>
              </Box>
            );
          })
        ) : (
          <Typography variant="body2" color="textSecondary">
            No attachments
          </Typography>
        )}
      </Box>

      <AttachmentPreviewDialog
        open={!!preview}
        file={preview}
        onClose={() => setPreview(null)}
        isImage={isFileImage}
      />
    </>
  );
};

export default AttachmentViewer;
