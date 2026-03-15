// components/reports/ExpandableTable.tsx
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { OrderType, PaymentMethod } from "./types/report.type";

interface ExpandableTableProps<T> {
  columns: {
    key: string;
    label: string;
    width?: string;
    align?: "left" | "center" | "right";
  }[];
  data: T[];
  expandedContent?: (item: T) => React.ReactNode;
  getRowId: (item: T) => string;
  onRowClick?: (item: T) => void;
}

export function ExpandableTable<T>({
  columns,
  data,
  expandedContent,
  getRowId,
  onRowClick,
}: ExpandableTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const renderCell = (item: any, key: string) => {
    const value = item[key];

    // Handle arrays (like items)
    if (Array.isArray(value)) {
      return (
        <Box>
          {value.length} Items
          <Typography variant="caption" display="block" color="text.secondary">
            Click to view details
          </Typography>
        </Box>
      );
    }

    // Handle numbers
    if (typeof value === "number") {
      if (
        key.includes("Amount") ||
        key.includes("Price") ||
        key.includes("Value") ||
        key === "gst"
      ) {
        return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return value.toLocaleString();
    }

    // Handle clickable IDs
    if (key === "orderId" || key === "expenseId" || key === "purchaseId") {
      return (
        <Typography
          color="primary"
          sx={{
            cursor: "pointer",
            fontWeight: 500,
            "&:hover": { textDecoration: "underline" },
          }}>
          {value}
        </Typography>
      );
    }

    // Handle order type with colored chips
    if (key === "orderType") {
      const color =
        value === OrderType.DELIVERY
          ? "primary"
          : value === OrderType.TAKEAWAY
            ? "secondary"
            : "default";
      return (
        <Chip label={value} size="small" color={color} variant="outlined" />
      );
    }

    // Handle payment method
    if (key === "paymentMethod") {
      return (
        <Chip label={value} size="small" color="default" variant="outlined" />
      );
    }

    // Handle date/time formatting
    if (key === "dateTime" && typeof value === "string") {
      return value;
    }

    // Default string rendering
    if (typeof value === "string") {
      return value;
    }

    // Fallback for objects
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        height:100
      }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            {expandedContent && <TableCell width="50px" />}
            {columns.map((column) => (
              <TableCell
                key={column.key}
                width={column.width}
                align={column.align || "left"}
                sx={{
                  py: 2,
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "text.primary",
                }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => {
            const rowId = getRowId(item);
            const isExpanded = expandedRows.has(rowId);

            return (
              <React.Fragment key={rowId}>
                <TableRow
                  hover
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:last-child td": { borderBottom: 0 },
                  }}
                  onClick={() => onRowClick?.(item)}>
                  {expandedContent && (
                    <TableCell>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(rowId);
                        }}>
                        {isExpanded ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )}
                      </IconButton>
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align || "left"}
                      sx={{ py: 2 }}>
                      {renderCell(item, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
                {expandedContent && isExpanded && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} sx={{ py: 0 }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 4, backgroundColor: "#fafafa" }}>
                          {expandedContent(item)}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
