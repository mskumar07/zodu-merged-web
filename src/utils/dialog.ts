import type { DialogProps } from "@mui/material";

/**
 * `onClose` for a dialog that should close only from its own Close (X) and
 * Cancel buttons — not from a click on the backdrop, and not from Escape, so a
 * half-filled form can't be thrown away by a stray click.
 *
 * MUI calls a Dialog's `onClose` for exactly those two reasons; the dialog's
 * own buttons call their handler directly and are unaffected. Wrapping rather
 * than dropping the prop keeps the real handler visible at the call site.
 *
 *   <Dialog open={open} onClose={closeFromControlsOnly(handleClose)}>
 *
 * Only use it on a dialog that has a visible close control of its own —
 * otherwise nothing is left that can close it.
 */
export function closeFromControlsOnly(onClose: () => void): NonNullable<DialogProps["onClose"]> {
  return (_event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };
}
