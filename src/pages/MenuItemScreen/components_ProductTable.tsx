import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import type { Product } from "./types";

interface ProductTableProps {
  products: Product[];
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const theme = useTheme();

  const columns: ColumnDef<Product>[] = [
    {
      key: "id",
      label: "Item ID",
      render: (product) => (
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{ color: "#1976d2" }}
        >
          {product.id}
        </Typography>
      ),
    },
    {
      key: "name",
      label: "Item Name",
      minWidth: 220,
      render: (product) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={product.imageUrl}
            variant="rounded"
            sx={{
              width: 40,
              height: 40,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {product.name[0]}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              color="text.primary"
              sx={{ lineHeight: 1.3 }}
            >
              {product.name}
            </Typography>
            <Typography
              variant="caption"
              fontWeight={400}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "text.disabled",
              }}
            >
              {product.category}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "mrp",
      label: "MRP",
      align: "right",
      render: (product) => (
        <Typography variant="body2" color="text.secondary">
          {formatINR(product.mrp)}
        </Typography>
      ),
    },
    {
      key: "rate",
      label: "Rate",
      align: "right",
      render: (product) => (
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {formatINR(product.rate)}
        </Typography>
      ),
    },
    {
      key: "gst",
      label: "GST",
      render: (product) => (
        <Typography variant="body2" color="text.secondary">
          {product.taxType}
        </Typography>
      ),
    },
    {
      key: "inclusion",
      label: "Inclusion",
      render: (product) => (
        <Typography variant="body2" color="text.secondary">
          {product.inclusion}
        </Typography>
      ),
    },
    {
      key: "hsn",
      label: "HSN",
      render: (product) => (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {product.hsn}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: () => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              sx={{
                color: "text.disabled",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "primary.light" + "22",
                },
                borderRadius: 1.5,
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              sx={{
                color: "primary.main",
                "&:hover": { bgcolor: "primary.light" + "22" },
                borderRadius: 1.5,
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <DataTable<Product>
      columns={columns}
      rows={products}
      rowKey={(product) => product.id}
      maxHeight={700}
      emptyMessage="No items found."
    />
  );
};

export default ProductTable;
