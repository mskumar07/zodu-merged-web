import React, { useState } from "react";
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
import ProductDetailsDialog from "./ProductDetailsDialog";

export interface Product {
  id: string;
  item_uuid: string;
  name: string;
  category: string;
  mrp: number;
  rate: number;
  purchase_price: number;
  taxType: string;
  inclusion: string;
  hsn: string;
  imageUrl?: string;
  status?: string;
}

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onEditFromDialog?: (item_uuid: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  loadMoreRef?: React.RefObject<HTMLTableRowElement>;
  tableContainerRef?: React.RefObject<HTMLDivElement>;
  maxHeight?: string | number;
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

const ProductTable: React.FC<ProductTableProps> = React.memo(
  ({
    products,
    onEdit,
    onDelete,
    onEditFromDialog,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
    tableContainerRef,
    maxHeight = "100%",
  }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const theme = useTheme();

    const handleViewProduct = (product: Product) => {
      setSelectedProduct(product);
      setOpenDialog(true);
    };

    const columns = React.useMemo<ColumnDef<Product>[]>(
      () => [
        {
          key: "id",
          label: "Item ID",
          render: (product) => (
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                color: "#1976d2",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => handleViewProduct(product)}
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
                sx={{ width: 40, height: 40, border: `1px solid ${theme.palette.divider}` }}
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
          key: "purchase_price",
          label: "Purchase Price",
          align: "right",
          render: (product) => (
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {formatINR(product.purchase_price)}
            </Typography>
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
            <Typography variant="body2" fontWeight={600} color="text.secondary">
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
            <Typography variant="body2" color="text.secondary">
              {product.hsn}
            </Typography>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          align: "center",
          render: (product) => (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(product)}
                  sx={{
                    color: "text.disabled",
                    "&:hover": { color: "primary.main", bgcolor: "primary.light" + "22" },
                    borderRadius: 1.5,
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete?.(product)}
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
      ],
      [onDelete, onEdit, theme]
    );

    return (
      <>
        <DataTable<Product>
          columns={columns}
          rows={products}
          rowKey={(product) => product.item_uuid}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadMoreRef={loadMoreRef}
          tableContainerRef={tableContainerRef}
          maxHeight={maxHeight}
          emptyMessage="No items found."
        />
        <ProductDetailsDialog
          open={openDialog}
          itemUuid={selectedProduct?.item_uuid || null}
          onClose={() => setOpenDialog(false)}
          onEdit={(uuid) => {
            setOpenDialog(false);
            onEditFromDialog?.(uuid);
          }}
        />
      </>
    );
  }
);

ProductTable.displayName = "ProductTable";

export default ProductTable;
