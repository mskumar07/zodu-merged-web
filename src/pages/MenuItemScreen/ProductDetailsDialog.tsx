import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { useMenuItemDetail } from "./useMenuItemApi";
import { useState } from "react";

interface Props {
  open: boolean;
  itemUuid: string | null;
  onClose: () => void;
  onEdit: (itemUuid: string) => void; // ✅ ADD
}

const INR = (v: any) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(v || 0));

// ✅ Convert GST Type → % (adjust if your backend differs)
// const getGstRate = (gstType: number) => {
//   switch (gstType) {
//     case 1: return "0%";
//     case 2: return "5%";
//     case 3: return "12%";
//     case 4: return "18%";
//     case 5: return "28%";
//     default: return "-";
//   }
// };

export default function ProductDetailsDialog({
  open,
  itemUuid,
  onClose,
onEdit
}: Props) {
  const { data, isLoading } = useMenuItemDetail(itemUuid);

  const item = data;
console.log(item)
  if (isLoading || !item) {
    return (

      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 5,
          }}
        >
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 900,
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>

        {/* HEADER */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={onClose}>
              <ArrowBackIcon />
            </IconButton>
            <Typography fontWeight={600}>Product Details</Typography>
          </Box>

          {/* ✅ Right Actions */}
          <Box>
           <IconButton onClick={() => onEdit(item.item_uuid)}>
  <EditIcon />
</IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* TOP SECTION */}
        <Box display="flex" gap={3} mb={3}>
          <Avatar
            src={item.item_img || ""}
            variant="rounded"
            sx={{ width: 120, height: 120, borderRadius: 3 }}
          >
            {item.item_name?.[0]}
          </Avatar>

          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                label={item.status?.toUpperCase()}
                color={item.status === "active" ? "success" : "default"}
                size="small"
              />
              <Typography fontSize={12} color="text.secondary">
                {item.category_name}
              </Typography>
            </Box>

            <Typography fontSize={22} fontWeight={700} mb={2}>
              {item.item_name}
            </Typography>

            {/* INFO */}
            <Box display="flex" gap={4} flexWrap="wrap">
              {[
                { label: "ITEM ID", value: item.item_id },
                { label: "HSN CODE", value: item.hsn_code },
                { label: "UNIT", value: item.unit_name },
                { label: "GST RATE", value: item.gst_rate ? item.gst_rate + "%" : "-" },
              ].map((i) => (
                <Box key={i.label}>
                  <Typography fontSize={11} color="#9CA3AF">
                    {i.label}
                  </Typography>
                  <Typography fontWeight={600}>
                    {i.value || "-"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* PRICING CARD */}
        <Box
          sx={{
            border: "1px solid #eee",
            borderRadius: 3,
            p: 2,
          }}
        >
          <Typography fontWeight={600} mb={2}>
            💰 Pricing Architecture
          </Typography>

          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography fontSize={12}>Selling Price</Typography>
              <Typography fontWeight={700} color="error">
                {INR(item.sell_price)}
              </Typography>
            </Box>

              <Box >
            <Typography fontSize={12}>Purchase Price</Typography>
            <Typography fontWeight={600}>
              {INR(item.purchase_price)}
            </Typography>
          </Box>

            <Box>
              <Typography fontSize={12}>MRP</Typography>
              <Typography sx={{ textDecoration: "line-through" }}>
                {INR(item.mrp)}
              </Typography>
            </Box>
          </Box>

        

          <Box mt={2}>
            <Typography fontSize={11} color="#9CA3AF">
              GST CONFIGURATION
            </Typography>
            <Typography>
              {item.tax_incl_type ? "Inclusive" : "Exclusive"}
            </Typography>
          </Box>
        </Box>

      </DialogContent>

     
    </Dialog>
    
      </>
  );
}