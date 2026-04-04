import React from "react";
import {
  Box, Card, Typography, CircularProgress,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Skeleton, Divider,
} from "@mui/material";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROW_HEIGHT    = 40;          // px — every body row is exactly this tall
const CELL_PX       = "5px 12px"; // padding: top/bottom 0 (height is controlled by ROW_HEIGHT), left/right 12px

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Column header label */
  label: React.ReactNode;
  /** Unique key for the column */
  key: string;
  /** Optional width */
  width?: number | string;
  /** Optional min-width */
  minWidth?: number | string;
  /** Alignment for both header and cell */
  align?: "left" | "center" | "right";
  /** Render function for the cell — receives the row item */
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  /** Column definitions including header labels and cell renderers */
  columns: ColumnDef<T>[];
  /** Flat array of data rows */
  rows: T[];
  /** Unique key extractor for each row */
  rowKey: (row: T) => string | number;
  /** Show skeleton rows while loading */
  isLoading?: boolean;
  /** Number of skeleton rows to show during loading */
  skeletonRows?: number;
  /** Whether more pages exist (for infinite scroll) */
  hasNextPage?: boolean;
  /** Whether the next page is currently being fetched */
  isFetchingNextPage?: boolean;
  /** Ref attached to the sentinel row that triggers infinite scroll */
  loadMoreRef?: React.RefObject<HTMLTableRowElement>;
  /** Ref for the scroll container (used by IntersectionObserver) */
  tableContainerRef?: React.RefObject<HTMLDivElement>;
  /** Max height of the scrollable table container */
  maxHeight?: string | number;
  /** Called when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Optional empty state message */
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
  // Keep cell content vertically centered when it wraps (e.g. balance sub-line)
  verticalAlign: "middle",
  backgroundColor: "#ffffff",
} as const;

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
  const colSpan = columns.length;
  const tableHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

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
      <TableContainer
        ref={tableContainerRef}
        component={Paper}
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          overflow: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{ borderCollapse: "separate", borderSpacing: 0, backgroundColor: "#ffffff" }}
        >

          {/* ── Header ─────────────────────────────────────────────────── */}
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align ?? "left"}
                  sx={{ ...headCellSx, width: col.width, minWidth: col.minWidth }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* ── Body ───────────────────────────────────────────────────── */}
          <TableBody>

            {/* Skeleton rows while loading */}
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

            {/* Infinite scroll sentinel (invisible trigger row) */}
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
