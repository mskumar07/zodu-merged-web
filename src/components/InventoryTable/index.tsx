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
  Chip,
  Typography,
} from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { MenuItemsTableProps } from "./types";
import type { MenuItem } from "../../types/menuItem";
import sort from "../../assets/icons/TableIcons/sort.png";
import nonveg from "../../assets/icons/TableIcons/non-veg.png";
import deleteIcon from "../../assets/icons/TableIcons/delete.png";
import edit from "../../assets/icons/TableIcons/edit.png";

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

const columns: ColumnDef<MenuItem>[] = [
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
      <Tooltip title={`View details for ${row.original.name}`}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <img
            src="https://boringapi.com/api/v1/static/photos/298.jpeg"
            alt="SKU"
            width={32}
            height={32}
            style={{ objectFit: "cover", borderRadius: 4, marginRight: 8 }}
          />
          <Typography
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "#1976d2",
              alignSelf: "center",
            }}
            variant="subtitle1"
            onClick={() => table.options.meta?.onRowClick?.(row.original)}
          >
            {row.original.sku}
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
      <Box>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle2">{row.original.name}</Typography>
          <img
            src={nonveg}
            style={{
              width: 16,
              height: 16,
              marginLeft: 5,
              verticalAlign: "middle",
            }}
          />
        </div>
        <Chip
          label={row.original.category}
          size="small"
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "text.secondary",
            height: "auto",
            px: 2,
            py: 0.5,
            mt: 1,
            borderRadius: 0.5,
            "& .MuiChip-label": { whiteSpace: "normal" },
          }}
        />
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
    cell: (info) => `$${info.getValue()}`,
  },
  {
    accessorKey: "purchasePrice",
    header: ({ column }) => (
      <Typography
        variant="body2"
        color="text.disabled"
        component="span"
        sx={{ cursor: "pointer" }}
        onClick={column.getToggleSortingHandler()}
      >
        Purchase Price{" "}
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
    cell: (info) => `${info.getValue()}`,
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
          <img
            src={deleteIcon}
            style={{
              width: 16,
              height: 16,
              marginLeft: 5,
              verticalAlign: "middle",
            }}
          />
        </IconButton>
        <IconButton
          aria-label="edit"
          size="small"
          onClick={() => table.options.meta?.onEdit?.(row.original)}
        >
          <img
            src={edit}
            style={{
              width: 16,
              height: 16,
              marginLeft: 5,
              verticalAlign: "middle",
            }}
          />
        </IconButton>
      </>
    ),
  },
];

const InventoryItemsTable: React.FC<MenuItemsTableProps> = ({
  items,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const table = useReactTable<MenuItem>({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onRowClick,
      onEdit,
      onDelete,
    },
  });

  return (
    <TableContainer>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell sx={{ padding: "6px 8px" }} key={header.id}>
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} sx={{ padding: "6px 8px" }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryItemsTable;
