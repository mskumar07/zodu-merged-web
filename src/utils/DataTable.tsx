import React, { Fragment, useRef } from "react";
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
const HEAD_BG = "#F5F5F5";
const HEAD_BORDER = "#CBD5E1";
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 34; // a notch shorter than a body row so the header reads as a label strip
const CELL_PX    = "5px 12px";
const FIT_CELL_PX = "5px 8px";
const FIT_HEAD_PX = "1px 8px";
// Approximate width of one header character (12.5px bold) — used to keep fitWidth headers on one line.
const HEAD_CHAR_PX = 7.5;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  label: React.ReactNode;
  key: string;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  /** Adjacent columns sharing a group get one spanning heading above their own labels. */
  group?: string;
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
  /** Height of each table header row. */
  headerHeight?: number;
  /** A pinned row (e.g. totals) under the scrolling body, aligned to the same columns. */
  footerRow?: T;
  /** Hides the "All N records loaded" line. */
  hideEndNote?: boolean;
  /**
   * Fit every column inside the container (no horizontal scroll): column widths become
   * proportions of the table width, long headers wrap and overflowing cell text is clipped.
   */
  fitWidth?: boolean;
  /** Extra rows rendered directly under a data row (e.g. an invoice's returns). */
  renderSubRows?: (row: T) => React.ReactNode;
  /** Replaces the default row for a data row when it returns something (e.g. a return entry); null/undefined keeps the default. */
  renderRow?: (row: T) => React.ReactNode;
}

// ─── Shared cell sx ───────────────────────────────────────────────────────────
const bodyCellSx = {
  height: ROW_HEIGHT,
  padding: CELL_PX,
  fontSize: "13px",
  color: "#374151",
  verticalAlign: "middle",
  backgroundColor: "#ffffff",
} as const;

// Resolve a column's effective width (number → px, string → as-is, undefined → auto)
function resolveColWidth<T>(col: ColumnDef<T>): string | number | undefined {
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
  headerHeight = HEADER_HEIGHT,
  footerRow,
  hideEndNote = false,
  fitWidth = false,
  renderSubRows,
  renderRow,
}: DataTableProps<T>) {
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const footerContainerRef = useRef<HTMLDivElement>(null);

  const colSpan    = columns.length;
  const tableHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
  const headCellSx = {
    height: headerHeight,
    padding: headerHeight < ROW_HEIGHT ? "1px 12px" : CELL_PX,
    lineHeight: `${headerHeight < ROW_HEIGHT ? Math.max(headerHeight - 4, 18) : headerHeight}px`,
    whiteSpace: "nowrap" as const,
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#6B7280",
    backgroundColor: HEAD_BG,
    borderBottom: `1px solid ${HEAD_BORDER}`,
    letterSpacing: "0.02em",
    ...(fitWidth && { padding: FIT_HEAD_PX, overflow: "hidden", textOverflow: "ellipsis" }),
  };
  const cellSx = fitWidth ? { ...bodyCellSx, padding: FIT_CELL_PX, overflow: "hidden" } : bodyCellSx;

  // Min width ensures horizontal scroll triggers at the same point for header + body
  const tableMinWidth = columns.reduce((sum, col) => {
    const w = resolveColWidth(col);
    return sum + (typeof w === "number" ? w : 100);
  }, 0);

  // fitWidth: a column never gets narrower than its one-line header…
  const headerMinWidth = (col: ColumnDef<T>) =>
    typeof col.label === "string" ? Math.ceil(col.label.length * HEAD_CHAR_PX) + 18 : 0;
  const fitWeight = (col: ColumnDef<T>, w: number) => Math.max(w, headerMinWidth(col));
  const fitTotal = columns.reduce((sum, col) => {
    const w = resolveColWidth(col);
    return sum + fitWeight(col, typeof w === "number" ? w : 100);
  }, 0);
  const fitMinWidth = columns.reduce((sum, col) => sum + headerMinWidth(col), 0);

  // …and a numeric width is that column's share of the whole table
  const colWidth = (col: ColumnDef<T>, w: string | number) => {
    if (typeof w !== "number") return w;
    return fitWidth ? `${(fitWeight(col, w) / fitTotal) * 100}%` : `${w}px`;
  };

  // Two header rows when any column is grouped: ungrouped columns span both, groups span their columns.
  const headerRows = (() => {
    if (!columns.some((c) => c.group)) return { grouped: false as const, top: [], sub: [] };
    const top: { key: string; label: React.ReactNode; align: "left" | "center" | "right"; colSpan: number; rowSpan: number; isGroup?: boolean }[] = [];
    const sub: ColumnDef<T>[] = [];
    for (let i = 0; i < columns.length; ) {
      const c = columns[i];
      if (!c.group) {
        top.push({ key: c.key, label: c.label, align: c.align ?? "left", colSpan: 1, rowSpan: 2 });
        i += 1;
        continue;
      }
      let j = i;
      while (j < columns.length && columns[j].group === c.group) j += 1;
      top.push({ key: `group-${c.group}-${i}`, label: c.group, align: "center", colSpan: j - i, rowSpan: 1, isGroup: true });
      for (let k = i; k < j; k += 1) sub.push(columns[k]);
      i = j;
    }
    return { grouped: true as const, top, sub };
  })();

  // Sync horizontal scroll from body → header
  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerContainerRef.current) {
      headerContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (footerContainerRef.current) {
      footerContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
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
            style={w !== undefined ? { width: colWidth(col, w) } : undefined}
          />
        );
      })}
    </colgroup>
  );

  const tableSx = {
    // fitWidth: fills the container; scrolls sideways only if the screen can't fit every header
    ...(fitWidth ? { width: "100%", minWidth: fitMinWidth } : { minWidth: tableMinWidth }),
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
        maxHeight: tableHeight,
        overflow: "hidden",
      }}
    >
      {/* ── Fixed Header (no scrollbar) ─────────────────────────────────── */}
      <Box
        ref={headerContainerRef}
        sx={{
          overflowX: "hidden",
          overflowY: "hidden",
          flexShrink: 0,
          // The reserved scrollbar gutter would otherwise show white past the last header cell.
          background: `linear-gradient(${HEAD_BORDER}, ${HEAD_BORDER}) bottom / 100% 1px no-repeat ${HEAD_BG}`,
          ...(fitWidth && { scrollbarGutter: "stable", ...bodyScrollbarSx }),
        }}
      >
        <Table size="small" sx={tableSx}>
          {colgroup}
          <TableHead>
            {headerRows.grouped ? (
              <>
                <TableRow>
                  {headerRows.top.map((c) => (
                    <TableCell
                      key={c.key}
                      align={c.align}
                      colSpan={c.colSpan}
                      rowSpan={c.rowSpan}
                      sx={c.isGroup ? { ...headCellSx, textAlign: "center", borderBottom: "1px solid #E5E7EB" } : headCellSx}
                    >
                      {c.label}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {headerRows.sub.map((col) => (
                    <TableCell key={col.key} align={col.align ?? "left"} sx={headCellSx}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </>
            ) : (
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
            )}
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
          ...(fitWidth && { scrollbarGutter: "stable" }),
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
                    <TableCell key={col.key} sx={cellSx}>
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
              rows.map((row) => {
                const custom = renderRow?.(row);
                if (custom != null) return <Fragment key={rowKey(row)}>{custom}</Fragment>;
                return (
                <Fragment key={rowKey(row)}>
                  <TableRow
                    hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{ height: ROW_HEIGHT, cursor: onRowClick ? "pointer" : "default" }}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align ?? "left"} sx={cellSx}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderSubRows?.(row)}
                </Fragment>
                );
              })}

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
            {!hideEndNote && !hasNextPage && rows.length > 0 && !isLoading && (
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

      {/* ── Pinned footer row ───────────────────────────────────────────── */}
      {footerRow && !isLoading && rows.length > 0 && (
        <Box
          ref={footerContainerRef}
          sx={{ overflowX: "hidden", overflowY: "hidden", flexShrink: 0, borderTop: "1px solid #CBD5E1", backgroundColor: "#F5F5F5" }}
        >
          <Table size="small" sx={tableSx}>
            {colgroup}
            <TableBody>
              <TableRow sx={{ height: ROW_HEIGHT }}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align ?? "left"}
                    sx={{ ...cellSx, backgroundColor: "#F5F5F5", borderBottom: 0 }}
                  >
                    {col.render(footerRow)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}

      <Divider />
    </Card>
  );
}

export default DataTable;
