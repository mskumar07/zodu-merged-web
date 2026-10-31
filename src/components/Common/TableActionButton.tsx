/**
 * TableActionButton.tsx
 * The edit / delete / return icon buttons used in every table's Actions column,
 * so each table shows the same icons with the same size, colour and hover.
 */
import type { MouseEvent, ReactNode } from "react";
import { IconButton, Tooltip, alpha } from "@mui/material";

export type TableActionKind = "edit" | "delete" | "return";

const ICON_PATHS: Record<TableActionKind, string> = {
  edit:   "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  delete: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  return: "M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4 2 4-2 4 2z",
};

const DEFAULT_TITLES: Record<TableActionKind, string> = {
  edit:   "Edit",
  delete: "Delete",
  return: "Return",
};

// Delete hovers in a deeper red than edit / return.
const HOVER_COLOR: Record<TableActionKind, string> = {
  edit:   "#E53935",
  delete: "#C62828",
  return: "#E53935",
};

export function TableActionIcon({ kind }: { kind: TableActionKind }) {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON_PATHS[kind]} />
    </svg>
  );
}

interface Props {
  kind:      TableActionKind;
  onClick?:  (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  title?:    ReactNode;   // tooltip; defaults to "Edit" / "Delete" / "Return"
  loading?:  boolean;     // e.g. while a delete is in flight
}

export default function TableActionButton({ kind, onClick, disabled, title, loading }: Props) {
  const hover = HOVER_COLOR[kind];
  return (
    <Tooltip title={title ?? DEFAULT_TITLES[kind]}>
      {/* span keeps the tooltip working while the button is disabled */}
      <span>
        <IconButton
          size="small"
          disabled={disabled || loading}
          onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
          sx={{
            color: "text.secondary",
            borderRadius: 1.5,
            "&:hover": { color: hover, bgcolor: alpha(hover, 0.06) },
            "&.Mui-disabled": { color: "text.disabled" },
          }}
        >
          <TableActionIcon kind={kind} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
