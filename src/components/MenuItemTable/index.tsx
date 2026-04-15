import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Checkbox,
  IconButton,
  Switch,
  Tooltip,
  Box,
  Avatar,
  Chip,
  Typography,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { useRef, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { MenuItemsTableProps } from "./types";
import type { MenuItem } from "../../types/menuItem";
import sort from "../../assets/icons/TableIcons/sort.png";
import nonveg from "../../assets/icons/TableIcons/non-veg.png";
import veg from "../../assets/icons/TableIcons/veg.png";
import deleteIcon from "../../assets/icons/TableIcons/delete.png";
import edit from "../../assets/icons/TableIcons/edit.png";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useTheme } from "@mui/material";

const SortIcon = ({ direction }: { direction?: "asc" | "desc" }) =>
  direction ? (
    <img
      src={sort}
      alt={direction === "asc" ? "Asc" : "Desc"}
      style={{
        width: 16,
        height: 16,
        marginLeft: 5,
        transform: direction === "desc" ? "rotate(180deg)" : "none",
        verticalAlign: "middle",
      }}
    />
  ) : null;

const MenuItemsTable: React.FC<MenuItemsTableProps> = ({
  items,
  pagination,
  loading,
  onChangePage,
  onRowClick,
  onEdit,
  onDelete,
  onStatus,
  onFav,
}) => {
  const theme = useTheme();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  console.log(items)

  const columns = React.useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Typography variant="body2" color="text.disabled">
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          </Typography>
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <Typography
            variant="body2"
            color="text.disabled"
            component="span"
            sx={{ cursor: "pointer" }}
            onClick={column.getToggleSortingHandler()}
          >
            Item Code / SKU{" "}
            <SortIcon
              direction={
                column.getIsSorted() === "desc"
                  ? "desc"
                  : column.getIsSorted() === "asc"
                  ? "asc"
                  : "asc"
              }
            />
          </Typography>
        ),
        enableSorting: true,
        cell: ({ row, table }) => (
          <Tooltip title={`View details for ${row.original.menu_name}`}>
            <Box sx={{ display: "flex", gap: 1 }}>
              {row.original.menu_image ? (
                <img
                  src={row.original.menu_image}
                  alt={row.original.menu_name || "Menu Item"}
                  width={32}
                  height={32}
                  style={{
                    objectFit: "cover",
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: 12,
                    borderRadius: 1,
                    marginRight: 1,
                    bgcolor: theme.palette.background.productCard,
                    color: theme.palette.customText.productCard,
                  }}
                >
                  {row.original.menu_name
                    ? row.original.menu_name.slice(0, 2).toUpperCase()
                    : "NA"}
                </Avatar>
              )}
              <Typography
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: theme.palette.customText.productCard,
                  alignSelf: "center",
                }}
                variant="subtitle1"
                onClick={() => table.options.meta?.onRowClick?.(row.original)}
              >
                {row.original.menu_id}
              </Typography>
            </Box>
          </Tooltip>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Typography
            variant="body2"
            color="text.disabled"
            component="span"
            sx={{ cursor: "pointer" }}
            onClick={column.getToggleSortingHandler()}
          >
            Menu Name{" "}
            <SortIcon
              direction={
                column.getIsSorted() === "desc"
                  ? "desc"
                  : column.getIsSorted() === "asc"
                  ? "asc"
                  : "asc"
              }
            />
          </Typography>
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 100,
              }}
            >
              <Typography variant="subtitle2">
                {row.original.menu_name}
              </Typography>
              <img
                src={row.original.food_type == "Veg" ? veg : nonveg}
                style={{ width: 16, height: 16, marginLeft: 5 }}
              />
            </div>

            <div>
              <Chip
                label={row.original.category}
                size="small"
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "text.secondary",
                  height: "auto",
                  px: 0.5,
                  py: 0.3,
                  mt: 0.2,
                  borderRadius: 4,
                  "& .MuiChip-label": { whiteSpace: "normal" },
                }}
              />
            </div>
          </Box>
        ),
      },
      {
        accessorKey: "sellPrice",
        header: ({ column }) => (
          <Typography
            variant="body2"
            color="text.disabled"
            component="span"
            sx={{ cursor: "pointer" }}
            onClick={column.getToggleSortingHandler()}
          >
            Sell Price{" "}
            <SortIcon
              direction={
                column.getIsSorted() === "desc"
                  ? "desc"
                  : column.getIsSorted() === "asc"
                  ? "asc"
                  : "asc"
              }
            />
          </Typography>
        ),
        enableSorting: true,
        cell: (info) => `₹ ${info.row.original.sell_price}`,
      },
     {
  accessorKey: "basePrice",
  header: ({ column }) => (
    <Typography
      variant="body2"
      color="text.disabled"
      component="span"
      sx={{ cursor: "pointer" }}
      onClick={column.getToggleSortingHandler()}
    >
      Base Price{" "}
      <SortIcon
        direction={
          column.getIsSorted() === "desc"
            ? "desc"
            : column.getIsSorted() === "asc"
            ? "asc"
            : "asc"
        }
      />
    </Typography>
  ),
  enableSorting: true,
  cell: (info) => {
const price = Number(info.row.original.purchase_price) || 0;
    return `₹ ${price}`;
  },
},
     {
  accessorKey: "gst",
  header: ({ column }) => (
    <Typography
      variant="body2"
      color="text.disabled"
      component="span"
      sx={{ cursor: "pointer" }}
      onClick={column.getToggleSortingHandler()}
    >
      GST %{" "}
      <SortIcon
        direction={
          column.getIsSorted() === "desc"
            ? "desc"
            : column.getIsSorted() === "asc"
            ? "asc"
            : "asc"
        }
      />
    </Typography>
  ),
  enableSorting: true,
        cell: (info) => `${info.row.original.gst_tax} %`,
},
      {
        accessorKey: "stock",
        header: ({ column }) => (
          <Typography
            variant="body2"
            color="text.disabled"
            component="span"
            sx={{ cursor: "pointer" }}
            onClick={column.getToggleSortingHandler()}
          >
            Stock{" "}
            <SortIcon
              direction={
                column.getIsSorted() === "desc"
                  ? "desc"
                  : column.getIsSorted() === "asc"
                  ? "asc"
                  : "asc"
              }
            />
          </Typography>
        ),
        enableSorting: true,
        cell: ({ row }) => `${row.original.count}`,
      },
      {
        accessorKey: "status",
        header: (
          <Typography variant="body2" color="text.disabled">
            Status
          </Typography>
        ),
        cell: ({ row, table }) => (
          <Switch
            checked={row.original.active}
            color="primary"
            onChange={() => table.options.meta?.onStatus?.(row.original)}
          />
        ),
      },
      {
        id: "actions",
        header: (
          <Typography variant="body2" color="text.disabled">
            Actions
          </Typography>
        ),
        cell: ({ row, table }) => (
          <>
            <IconButton
              aria-label="delete"
              size="small"
              onClick={() => table.options.meta?.onDelete?.(row.original)}
            >
              <img src={deleteIcon} style={{ width: 16, height: 16 }} />
            </IconButton>

            <IconButton
              aria-label="edit"
              size="small"
              onClick={() => table.options.meta?.onEdit?.(row.original)}
            >
              <img src={edit} style={{ width: 16, height: 16 }} />
            </IconButton>

            <IconButton
              aria-label="Favorite"
              size="small"
              onClick={() => table.options.meta?.onFav?.(row.original)}
            >
              {row.original.favorites ? (
                <Favorite color={"primary"} />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </>
        ),
      },
    ],
    [theme]
  );

  /** ---------- Infinite Scroll Ref ---------- **/
  const containerRef = useRef<HTMLDivElement | null>(null);

  /** 🟩 Define Total Pages */
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  /** 🔥 Infinite Scroll Detector */
  const handleScroll = useCallback(() => {

    const container = containerRef.current;
    if (!container || pagination.loading) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // 🛑 Stop if already on last page
    if (pagination.current_page >= totalPages - 1) return;

    // 🎯 Load more when near bottom
 
    if (scrollTop + clientHeight >= scrollHeight - 350) {
       onChangePage(pagination.current_page + 1);
    }
  }, [pagination, totalPages]);

  /** 🚀 Attach Scroll Listener */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /** -----------------------------
   * 🟦 TanStack Pagination Setup
   * ----------------------------- */
 const table = useReactTable<MenuItem>({
    data: items,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.current_page,
        pageSize: pagination.limit,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    meta: { onRowClick, onEdit, onDelete, onStatus, onFav },
  });

  return (
   <TableContainer
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%", 
        overflowY: "auto",
        border: "1px solid #e0e0e0",
        "&::-webkit-scrollbar": {
          width: 8,
          height: 8,
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#cbd5e1",
          borderRadius: "4px",
          "&:hover": {
            background: "#94a3b8",
          },
        },
      }}
    >
      <Table stickyHeader>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell key={header.id} sx={{ padding: "6px 8px" }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody>
          {table.getRowModel().rows.map((row, i) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} sx={{ padding: "6px 8px" }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* 🌀 Show Loader at Bottom when Fetching Next Page */}
          {loading &&(
            <TableRow>
              <TableCell colSpan={12} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MenuItemsTable;
