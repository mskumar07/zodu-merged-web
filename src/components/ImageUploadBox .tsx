//Z-T94
import React, { useRef, useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";

const ImageUploadBox = ({ values, setFieldValue }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size (below 5MB)
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file (jpg/png).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be below 5MB.");
        return;
      }

      setFieldValue("attachments", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      onClick={() => fileInputRef.current?.click()}
      sx={{
        height: 160,
        width: "100%",
        border: "2px dashed #ccc",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        bgcolor: "#fafafa",
        "&:hover": { bgcolor: "#f0f0f0" },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <input
        type="file"
        hidden
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {preview ? (
        <Avatar
          src={preview}
          alt="Preview"
          variant="rounded"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 2,
          }}
        />
      ) : (
        <>
          <UploadIcon sx={{ fontSize: 36, color: "#888" }} />
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: "#555" }}>
            Add Image
          </Typography>
          <Typography variant="caption" sx={{ mt: 0.5, color: "#999" }}>
            (img/png should be below 5MB)
          </Typography>
        </>
      )}
    </Box>
  );
};

export default ImageUploadBox;
