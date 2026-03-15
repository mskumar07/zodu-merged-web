import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Checkbox,
 
  Box,
  Typography,
} from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { OrderReportTable } from "./types";
import type { OrderReportTableProps } from "../../types/reportTable";
import sort from "../../assets/icons/TableIcons/sort.png";


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

const columns: ColumnDef<OrderReportTableProps>[] = [
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
    accessorKey: "orderId",
    header: ({ column }) => (
      <Typography
        variant="body2"
        color="text.disabled"
        component="span"
        sx={{ cursor: "pointer" }}
        onClick={column.getToggleSortingHandler()}
      >
        Order Id{" "}
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
      <Typography
        style={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "#1976d2",
          alignSelf: "center",
        }}
        variant="subtitle1"
        onClick={() => table.options.meta?.onRowClick(row.original)}
      >
        {row.original.public_order_no}
      </Typography>
    ),
  },
  {
    accessorKey: "orderType",
    header: ({ column }) => (
      <Typography
        variant="body2"
        color="text.disabled"
        component="span"
        sx={{ cursor: "pointer" }}
        onClick={column.getToggleSortingHandler()}
      >
        Order Type{" "}
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
          <Typography variant="subtitle2">{row.original.orderType}</Typography>
        </div>
      </Box>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Typography
        variant="body2"
        color="text.disabled"
        component="span"
        sx={{ cursor: "pointer" }}
        onClick={column.getToggleSortingHandler()}
      >
        Date{" "}
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
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <Typography
        variant="body2"
        color="text.disabled"
        component="span"
        sx={{ cursor: "pointer" }}
        onClick={column.getToggleSortingHandler()}
      >
        Total Amount{" "}
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
    accessorKey: "totalItems",
    header: ({ column }) => (
      <Typography
        variant="body2"
        color="text.disabled"
        component="span"
        sx={{ cursor: "pointer" }}
        onClick={column.getToggleSortingHandler()}
      >
        Total Items{" "}
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
    id: "gst",
    header: (
      <Typography variant="body2" color="text.disabled">
        GST%
      </Typography>
    ),
    cell: ({ row, table }) => (
      <>
        <Typography variant="body2">{row.original.gst}</Typography>
      </>
    ),
  },
  {
    id: "paymentMethod",
    header: (
      <Typography variant="body2" color="text.disabled">
        Payment Method
      </Typography>
    ),
    cell: ({ row, table }) => (
      <>
        <Typography variant="body2">{row.original.paymentMethod}</Typography>
      </>
    ),
  },
];

const OrderReportTable: React.FC<OrderReportTable> = ({
  items,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const table = useReactTable<OrderReportTableProps>({
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

export default OrderReportTable;
