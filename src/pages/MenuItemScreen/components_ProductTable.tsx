import React from "react";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Typography,
  Chip,
  IconButton,
  Avatar,
  useTheme,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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

const COLUMN_HEADERS = [
  { label: "Image", align: "left" as const },
  { label: "Item ID", align: "left" as const },
  { label: "Item Name", align: "left" as const },
  { label: "Item Type", align: "left" as const },
  { label: "MRP", align: "right" as const },
  { label: "Rate", align: "right" as const },
  { label: "Tax Type", align: "left" as const },
  { label: "Inclusion", align: "left" as const },
  { label: "HSN", align: "left" as const },
  { label: "Actions", align: "center" as const },
];

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const theme = useTheme();

  const stickyActionStyle = {
    position: "sticky" as const,
    right: 0,
    zIndex: 1,
    boxShadow: "-6px 0 12px -4px rgba(0,0,0,0.08)",
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: 700,
      }}
    >
      <Box
        sx={{
          overflowX: "auto",
          overflowY: "auto",
          flex: 1,
          "&::-webkit-scrollbar": { width: 6, height: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.divider,
            borderRadius: 10,
          },
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              {COLUMN_HEADERS.map((col) => (
                <TableCell
                  key={col.label}
                  align={col.align}
                  sx={{
                    py: 1.8,
                    px: 2,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "text.secondary",
                    bgcolor: "action.hover",
                    whiteSpace: "nowrap",
                    background:"#fff",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary" variant="body2">
                    No items found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{
                    "&:last-child td": { border: 0 },
                    transition: "background 0.15s",
                  }}
                >
                  {/* Image */}
                  <TableCell sx={{ px: 2, py: 1.5 }}>
                    <Avatar
                      src={product.imageUrl}
                      variant="rounded"
                      sx={{
                        width: 48,
                        height: 48,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {product.name[0]}
                    </Avatar>
                  </TableCell>

                  {/* ID */}
                  <TableCell sx={{ px: 2 }}>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      fontWeight={500}
                      color="text.secondary"
                    >
                      {product.id}
                    </Typography>
                  </TableCell>

                  {/* Name + Category */}
                  <TableCell sx={{ px: 2, minWidth: 180 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="text.primary"
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "text.disabled",
                      }}
                    >
                      {product.category}
                    </Typography>
                  </TableCell>

                  {/* Item Type */}
                  <TableCell sx={{ px: 2 }}>
                    <Chip
                      label={product.itemType}
                      size="small"
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        height: 22,
                        bgcolor:
                          product.itemType === "Sellable Product"
                            ? "rgba(59,130,246,0.1)"
                            : "rgba(245,158,11,0.1)",
                        color:
                          product.itemType === "Sellable Product"
                            ? "#2563eb"
                            : "#b45309",
                        border: "none",
                      }}
                    />
                  </TableCell>

                  {/* MRP */}
                  <TableCell align="right" sx={{ px: 2 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {formatINR(product.mrp)}
                    </Typography>
                  </TableCell>

                  {/* Rate */}
                  <TableCell align="right" sx={{ px: 2 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {formatINR(product.rate)}
                    </Typography>
                  </TableCell>

                  {/* Tax Type */}
                  <TableCell sx={{ px: 2 }}>
                    <Box
                      component="span"
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        px: 1,
                        py: 0.4,
                        bgcolor: "action.selected",
                        borderRadius: 1,
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.taxType}
                    </Box>
                  </TableCell>

                  {/* Inclusion */}
                  <TableCell sx={{ px: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{
                        textTransform: "uppercase",
                        color: "text.secondary",
                      }}
                    >
                      {product.inclusion}
                    </Typography>
                  </TableCell>

                  {/* HSN */}
                  <TableCell sx={{ px: 2 }}>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      color="text.secondary"
                    >
                      {product.hsn}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    align="center"
                    sx={{
                      px: 2,
                     
                    
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default ProductTable;
