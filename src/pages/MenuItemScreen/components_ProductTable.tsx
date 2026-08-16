import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Switch,
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
  onToggleStatus?: (product: Product, newStatus: "active" | "inactive") => void;
  onEditFromDialog?: (item_uuid: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  loadMoreRef?: React.RefObject<HTMLTableRowElement>;
  tableContainerRef?: React.RefObject<HTMLDivElement>;
  maxHeight?: string | number;
  canEdit?: boolean;
  canDelete?: boolean;
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
const TABLE_TEXT_COLOR = "#374151";

const ProductTable: React.FC<ProductTableProps> = React.memo(
  ({
    products,
    onEdit,
    onDelete,
    onToggleStatus,
    onEditFromDialog,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
    tableContainerRef,
    maxHeight = "100%",
    canEdit = true,
    canDelete = true,
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
                fontSize: 13,
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
          width: 220,
          render: (product) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, maxWidth: 220 }}>
              <Avatar
                src={product.imageUrl}
                variant="rounded"
                sx={{ width: 40, height: 40, border: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}
              >
                {product.name[0]}
              </Avatar>
              <Box>
                <Typography
                  fontWeight={600}
                  sx={{
                    lineHeight: 1.4,
                    fontSize: 13,
                    color: TABLE_TEXT_COLOR,
                    whiteSpace: "normal",
                    wordBreak: "break-all",
                    width: 175,
                  }}
                >
                  {product.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: TABLE_TEXT_COLOR,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    maxWidth: 165,
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
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13, color: TABLE_TEXT_COLOR }}>
              {formatINR(product.purchase_price)}
            </Typography>
          ),
        },
        {
          key: "mrp",
          label: "MRP",
          align: "right",
          render: (product) => (
            <Typography variant="body2" sx={{ fontSize: 13, color: TABLE_TEXT_COLOR }}>
              {formatINR(product.mrp)}
            </Typography>
          ),
        },
        {
          key: "rate",
          label: "Rate",
          align: "right",
          render: (product) => (
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13, color: TABLE_TEXT_COLOR }}>
              {formatINR(product.rate)}
            </Typography>
          ),
        },
        {
          key: "hsn",
          label: "HSN",
          render: (product) => (
            <Typography variant="body2" sx={{ fontSize: 13, color: TABLE_TEXT_COLOR }}>
              {product.hsn}
            </Typography>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (product) => (
            <Switch
              checked={product.status === "active"}
              onChange={(e) =>
                onToggleStatus?.(product, e.target.checked ? "active" : "inactive")
              }
              size="small"
              color="primary"
              disabled={!canEdit}
            />
          ),
        },
        {
          key: "actions",
          label: "Actions",
          align: "center",
          render: (product) => (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
              <Tooltip title={canEdit ? "Edit" : "You don't have permission to edit"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onEdit?.(product)}
                    disabled={!canEdit}
                    sx={{
                      color: "text.disabled",
                      "&:hover": { color: "primary.main", bgcolor: "primary.light" + "22" },
                      borderRadius: 1.5,
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={canDelete ? "Delete" : "You don't have permission to delete"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onDelete?.(product)}
                    disabled={!canDelete}
                    sx={{
                      color: "primary.main",
                      "&:hover": { bgcolor: "primary.light" + "22" },
                      borderRadius: 1.5,
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ),
        },
      ],
      [onDelete, onEdit, onToggleStatus, theme, canEdit, canDelete]
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
          onDelete={(uuid) => {
            setOpenDialog(false);
            onDelete?.({ item_uuid: uuid } as Product);
          }}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </>
    );
  }
);

ProductTable.displayName = "ProductTable";

export default ProductTable;
