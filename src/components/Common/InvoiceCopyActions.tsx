import { useState, type ReactNode } from "react";
import { Box, Button, CircularProgress, ListItemIcon, ListItemText, Menu, MenuItem, type SxProps, type Theme } from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";

/**
 * The Download / Print control in the invoice dialogs.
 *
 * Clicking the button body runs the action for the FIRST configured copy type
 * straight away — the common case shouldn't cost a menu trip. The caret opens
 * the rest: one entry per copy type configured in Invoice Settings, plus "All
 * Copies" (only meaningful, and only offered, when more than one is configured)
 * which produces every copy in a single document.
 */
export interface InvoiceCopyActionsProps {
  /** Verb shown on the button and prefixed onto every menu entry, e.g. "Download". */
  label: string;
  /** Leading icon for the button body and the per-copy menu entries. */
  icon: ReactNode;
  /** Copy types from Invoice Settings, already ordered and non-empty in practice. */
  copyTypes: string[];
  /**
   * Runs the action. `copies` holds the copy types to produce, in order — one
   * entry for a single copy, every configured type for "All Copies". It is
   * empty only when no copy types are configured at all, meaning "just render
   * the invoice with no copy marking".
   */
  onRun: (copies: string[]) => void;
  busy?: boolean;
  disabled?: boolean;
  /** Styles for the button body — each host dialog has its own look. */
  buttonSx?: SxProps<Theme>;
  /** Set on the POS modal, where actions share a row of equal-width buttons. */
  fullWidth?: boolean;
}

export default function InvoiceCopyActions({
  label,
  icon,
  copyTypes,
  onRun,
  busy = false,
  disabled = false,
  buttonSx,
  fullWidth = false,
}: InvoiceCopyActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // "All Copies" only earns a row when there is more than one copy to gather.
  const showAllCopies = copyTypes.length > 1;

  const run = (copies: string[]) => {
    setAnchorEl(null);
    onRun(copies);
  };

  const leadingIcon = busy ? <CircularProgress size={16} /> : icon;

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "stretch", width: fullWidth ? "100%" : "auto" }}>
        <Button
          onClick={() => run(copyTypes.slice(0, 1))}
          disabled={disabled || busy}
          startIcon={leadingIcon}
          sx={{
            ...buttonSx,
            // Flex rather than fullWidth: the caret sits in the same row, so a
            // 100%-wide body would push it out of the slot the host gave us.
            ...(fullWidth ? { flex: 1, minWidth: 0 } : null),
            // Fuse the two halves into one control.
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          {label}
        </Button>
        <Button
          onClick={(e) => setAnchorEl(e.currentTarget)}
          disabled={disabled || busy}
          aria-label={`More ${label.toLowerCase()} options`}
          sx={{
            ...buttonSx,
            minWidth: 34,
            width: 34,
            flexShrink: 0,
            px: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            // A hairline seam so the caret reads as a separate target.
            borderLeft: "1px solid rgba(0,0,0,0.12)",
          }}
        >
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
        </Button>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: 2,
              minWidth: 210,
              boxShadow: "0 12px 32px -8px rgba(15,23,42,0.25)",
            },
          },
        }}
      >
        {copyTypes.map((type, i) => (
          <MenuItem key={type} onClick={() => run([type])} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 34, color: "#475569" }}>
              {i === 0 ? <DescriptionOutlinedIcon sx={{ fontSize: 19 }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 19 }} />}
            </ListItemIcon>
            <ListItemText
              primary={`${label} ${type}`}
              primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}
            />
          </MenuItem>
        ))}
        {showAllCopies && (
          <MenuItem onClick={() => run(copyTypes)} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 34, color: "#475569" }}>
              <FolderOutlinedIcon sx={{ fontSize: 19 }} />
            </ListItemIcon>
            <ListItemText
              primary={`${label} All Copies`}
              primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
