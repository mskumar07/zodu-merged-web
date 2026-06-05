import React, { useRef } from "react";
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROW_HEIGHT = 40;
const CELL_PX    = "5px 12px";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  label: React.ReactNode;
  key: string;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  skeletonRows?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  loadMoreRef?: React.RefObject<HTMLTableRowElement | null>;
  tableContainerRef?: React.RefObject<HTMLDivElement | null>;
  maxHeight?: string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

// ─── Shared cell sx ───────────────────────────────────────────────────────────
const headCellSx = {
  height: ROW_HEIGHT,
  padding: CELL_PX,
  lineHeight: `${ROW_HEIGHT}px`,
  whiteSpace: "nowrap" as const,
  fontSize: "13px",
  fontWeight: 500,
  color: "#374151",
  backgroundColor: "#F5F5F5",
  borderBottom: "1px solid #CBD5E1",
} as const;

const bodyCellSx = {
  height: ROW_HEIGHT,
  padding: CELL_PX,
  fontSize: "13px",
  color: "#374151",
  verticalAlign: "middle",
  backgroundColor: "#ffffff",
} as const;

// Resolve a column's effective width (number → px, string → as-is, undefined → auto)
function resolveColWidth(col: ColumnDef<unknown>): string | number | undefined {
  return col.width ?? col.minWidth;
}

// ─── Component ────────────────────────────────────────────────────────────────

function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  skeletonRows = 8,
  hasNextPage,
  isFetchingNextPage,
  loadMoreRef,
  tableContainerRef,
  maxHeight = "68vh",
  onRowClick,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const headerContainerRef = useRef<HTMLDivElement>(null);

  const colSpan    = columns.length;
  const tableHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  // Min width ensures horizontal scroll triggers at the same point for header + body
  const tableMinWidth = columns.reduce((sum, col) => {
    const w = resolveColWidth(col);
    return sum + (typeof w === "number" ? w : 100);
  }, 0);

  // Sync horizontal scroll from body → header
  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerContainerRef.current) {
      headerContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Shared colgroup — same for both tables so column widths are identical
  const colgroup = (
    <colgroup>
      {columns.map((col) => {
        const w = resolveColWidth(col);
        return (
          <col
            key={col.key}
            style={
              w !== undefined
                ? { width: typeof w === "number" ? `${w}px` : w }
                : undefined
            }
          />
        );
      })}
    </colgroup>
  );

  const tableSx = {
    minWidth: tableMinWidth,
    tableLayout: "fixed" as const,
    borderCollapse: "separate" as const,
    borderSpacing: 0,
    backgroundColor: "#ffffff",
  };

  const bodyScrollbarSx = {
    scrollbarWidth: "thin" as const,
    scrollbarColor: "#d98f8f transparent",
    "&::-webkit-scrollbar": { width: 6, height: 6 },
    "&::-webkit-scrollbar-track": { background: "transparent", borderRadius: "999px" },
    "&::-webkit-scrollbar-thumb": {
      background: "#d98f8f",
      borderRadius: "999px",
      border: "1px solid #ffffff",
      minHeight: 40,
    },
  };

  return (
    <Card
      elevation={3}
      sx={{
        boxShadow: "0 4px 16px rgba(26,26,26,0.08)",
        border: "1px solid #E5E7EB",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: tableHeight,
        maxHeight: tableHeight,
        overflow: "hidden",
      }}
    >
      {/* ── Fixed Header (no scrollbar) ─────────────────────────────────── */}
      <Box
        ref={headerContainerRef}
        sx={{ overflowX: "hidden", overflowY: "hidden", flexShrink: 0 }}
      >
        <Table size="small" sx={tableSx}>
          {colgroup}
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align ?? "left"}
                  sx={headCellSx}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
      </Box>

      {/* ── Scrollable Body ─────────────────────────────────────────────── */}
      <TableContainer
        ref={tableContainerRef}
        component={Paper}
        elevation={0}
        onScroll={handleBodyScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          backgroundColor: "#ffffff",
          ...bodyScrollbarSx,
        }}
      >
        <Table size="small" sx={tableSx}>
          {colgroup}
          <TableBody>

            {/* Skeleton rows */}
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} sx={{ height: ROW_HEIGHT }}>
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={bodyCellSx}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!isLoading && rows.length === 0 && (
              <TableRow sx={{ height: ROW_HEIGHT * 5 }}>
                <TableCell colSpan={colSpan} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              rows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ height: ROW_HEIGHT, cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align ?? "left"} sx={bodyCellSx}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Infinite scroll sentinel */}
            {hasNextPage && (
              <TableRow ref={loadMoreRef} sx={{ height: 20 }}>
                <TableCell colSpan={colSpan} sx={{ py: 0, border: 0 }} />
              </TableRow>
            )}

            {/* Fetching next page spinner */}
            {isFetchingNextPage && (
              <TableRow sx={{ height: ROW_HEIGHT }}>
                <TableCell colSpan={colSpan} align="center" sx={bodyCellSx}>
                  <CircularProgress size={20} color="primary" />
                </TableCell>
              </TableRow>
            )}

            {/* All records loaded footer */}
            {!hasNextPage && rows.length > 0 && !isLoading && (
              <TableRow sx={{ height: ROW_HEIGHT }}>
                <TableCell colSpan={colSpan} align="center" sx={bodyCellSx}>
                  <Typography variant="caption" color="text.secondary">
                    All {rows.length} records loaded
                  </Typography>
                </TableCell>
              </TableRow>
            )}

          </TableBody>
        </Table>
      </TableContainer>

      <Divider />
    </Card>
  );
}

export default DataTable;
