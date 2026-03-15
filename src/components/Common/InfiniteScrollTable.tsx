// components/Common/SimpleInfiniteScrollTable.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

interface SimpleInfiniteScrollTableProps {
  items: any[];
  columns: Array<{
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
    sortable?: boolean;
    sortFunction?: (a: any, b: any, key: string) => number;
    align?: "left" | "center" | "right";
  }>;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRowClick?: (item: any) => void;
  emptyMessage?: string;
}

type SortDirection = "asc" | "desc" | null;

const SimpleInfiniteScrollTable: React.FC<SimpleInfiniteScrollTableProps> = ({
  items,
  columns,
  loading,
  hasMore,
  onLoadMore,
  onRowClick,
  emptyMessage = "No data found",
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(null);

  // Handle scroll
  const handleScroll = () => {
    if (!tableContainerRef.current || loading || !hasMore) return;

    const container = tableContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      onLoadMore();
    }
  };

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loading, hasMore, onLoadMore]);

  // Handle sort click
  const handleSortClick = (key: string) => {
    let direction: SortDirection = "asc";

    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      } else {
        direction = "asc";
      }
    }

    if (direction === null) {
      setSortConfig(null);
    } else {
      setSortConfig({ key, direction });
    }
  };

  // Sort items
  const sortedItems = useMemo(() => {
    if (!sortConfig || !sortConfig.key) return items;

    return [...items].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key);

      // Use custom sort function if provided
      if (column?.sortFunction) {
        return column.sortFunction(a, b, sortConfig.key);
      }

      // Default sorting logic
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
      if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;

      // Handle numbers
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // Handle strings
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [items, sortConfig, columns]);

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <UnfoldMoreIcon fontSize="small" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUpwardIcon fontSize="small" />
    ) : (
      <ArrowDownwardIcon fontSize="small" />
    );
  };

  return (
    <TableContainer
      ref={tableContainerRef}
      component={Paper}
      sx={{
        maxHeight: 600,
        overflow: "auto",
        position: "relative",
      }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align || "left"}>
                {column.sortable !== false ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: column.align === "center" ? "center" : column.align === "right" ? "flex-end" : "flex-start",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                      borderRadius: 1,
                      p: 0.5,
                    }}
                    onClick={() => handleSortClick(column.key)}>
                    <Typography fontWeight="bold" sx={{ mr: 1 }}>
                      {column.label}
                    </Typography>
                    {getSortIcon(column.key)}
                  </Box>
                ) : (
                  <Typography fontWeight="bold">{column.label}</Typography>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item, index) => (
            <TableRow
              key={index}
              hover={!!onRowClick}
              onClick={() => onRowClick && onRowClick(item)}
              sx={{ cursor: onRowClick ? "pointer" : "default" }}>
              {columns.map((column) => (
                <TableCell key={`${index}-${column.key}`} align={column.align || "left"}>
                  {column.render
                    ? column.render(item)
                    : item[column.key] || "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Empty state */}
      {sortedItems.length === 0 && !loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Box>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>
            {sortedItems.length === 0 ? "Loading..." : "Loading more..."}
          </Typography>
        </Box>
      )}

      {/* No more data indicator */}
      {!hasMore && sortedItems.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
          <Typography color="text.secondary">No more data to load</Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default SimpleInfiniteScrollTable;
