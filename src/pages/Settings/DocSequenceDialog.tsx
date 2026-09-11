/**
 * DocSequenceDialog.tsx
 * ─────────────────────────────────────────────────────────────
 * The "someone skipped numbers, put the sequence back" control.
 *
 * Writing a counter rewrites billing numbers for every document that follows,
 * and setting it below what has already been issued invites duplicate ids —
 * so the dialog reads the live counter first, previews the id the change will
 * produce, and takes a second, explicit confirmation before the PUT.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import {
  useDocSequence,
  useUpdateDocSequence,
  type DocType,
} from "./useDocSequenceApi";

// Only the three POS counters are adjustable from this screen. The service
// keeps others (PUR, EXP, CUS) that belong to their own modules.
const ADJUSTABLE: Array<{ value: DocType; label: string }> = [
  { value: "INV", label: "Invoice" },
  { value: "QUO", label: "Quotation" },
  { value: "PRO", label: "Proforma" },
];

const headingText = "#1d2533";
const subtleText = "#6b7280";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: (message: string) => void;
}

export default function DocSequenceDialog({ open, onClose, onSaved }: Props) {
  const [docType, setDocType] = useState<DocType>("INV");
  const [lastSeqInput, setLastSeqInput] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: sequence, isLoading, isError } = useDocSequence(docType, open);

  // Re-reading a different counter invalidates whatever was typed for the last
  // one, and drops back out of the confirm step.
  useEffect(() => {
    setLastSeqInput("");
    setConfirming(false);
    setErrorMsg(null);
  }, [docType]);

  useEffect(() => {
    if (open) {
      setDocType("INV");
      setLastSeqInput("");
      setConfirming(false);
      setErrorMsg(null);
    }
  }, [open]);

  const { mutate: save, isPending } = useUpdateDocSequence({
    onSuccess: (updated) => {
      onSaved?.(`Next ${labelFor(docType)} will be ${updated.next_id}`);
      onClose();
    },
    onError: (msg) => {
      setErrorMsg(msg);
      setConfirming(false);
    },
  });

  const parsed = useMemo(() => {
    const trimmed = lastSeqInput.trim();
    if (trimmed === "") return null;
    // Whole, non-negative only: the counter is a count of issued documents.
    if (!/^\d+$/.test(trimmed)) return NaN;
    return Number(trimmed);
  }, [lastSeqInput]);

  const isValid = parsed !== null && Number.isFinite(parsed) && !Number.isNaN(parsed);
  const unchanged = isValid && sequence != null && parsed === sequence.last_seq;
  // Rewinding re-issues numbers that already exist on saved documents.
  const rewinds = isValid && sequence != null && (parsed as number) < sequence.last_seq;

  const handleSubmit = () => {
    if (!isValid || unchanged) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setErrorMsg(null);
    save({ docType, lastSeq: parsed as number });
  };

  return (
    <Dialog open={open} onClose={() => !isPending && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: headingText, pb: 1 }}>
        Correct Document Sequence
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ fontSize: 12.5, color: subtleText, mb: 2.5 }}>
          Sets the last number issued. The next document is numbered one after it.
        </Typography>

        <Stack spacing={2.25}>
          <Box>
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: subtleText, mb: 0.75 }}>
              DOCUMENT TYPE
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={docType}
                disabled={isPending}
                onChange={(e) => setDocType(e.target.value as DocType)}
              >
                {ADJUSTABLE.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ borderRadius: 1.5, border: "1px solid #e5e7eb", bgcolor: "#f9fafb", px: 1.75, py: 1.5 }}>
            {isLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={14} />
                <Typography sx={{ fontSize: 12.5, color: subtleText }}>Reading the counter…</Typography>
              </Stack>
            ) : isError || !sequence ? (
              <Typography sx={{ fontSize: 12.5, color: "#b91c1c" }}>
                Could not read the current sequence.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                <Row label="Last issued" value={String(sequence.last_seq)} />
                <Row label="Next number" value={String(sequence.next_seq)} />
                <Row label="Next ID" value={sequence.next_id} strong />
              </Stack>
            )}
          </Box>

          <Box>
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: subtleText, mb: 0.75 }}>
              SET LAST ISSUED NUMBER
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={lastSeqInput}
              disabled={isPending || !sequence}
              onChange={(e) => {
                setLastSeqInput(e.target.value.replace(/[^0-9]/g, ""));
                setConfirming(false);
                setErrorMsg(null);
              }}
              placeholder={sequence ? String(sequence.last_seq) : "0"}
              inputProps={{ inputMode: "numeric", maxLength: 12 }}
            />
            {isValid && sequence && (
              <Typography sx={{ fontSize: 12, color: subtleText, mt: 0.75 }}>
                Next {labelFor(docType).toLowerCase()} will be number{" "}
                <Box component="span" sx={{ fontWeight: 800, color: headingText }}>
                  {(parsed as number) + 1}
                </Box>
                .
              </Typography>
            )}
          </Box>

          {unchanged && (
            <Alert severity="info" sx={{ fontSize: 12, py: 0.25, alignItems: "center" }}>
              That is already the current value.
            </Alert>
          )}

          {rewinds && (
            <Alert
              severity="warning"
              icon={<WarningAmberRoundedIcon fontSize="small" />}
              sx={{ fontSize: 12, py: 0.25 }}
            >
              This is below the last issued number ({sequence?.last_seq}). Numbers already
              on saved documents would be handed out again.
            </Alert>
          )}

          {confirming && !unchanged && (
            <Alert severity="warning" sx={{ fontSize: 12, py: 0.25 }}>
              This changes billing numbers for every {labelFor(docType).toLowerCase()} from here on.
              Press Update again to confirm.
            </Alert>
          )}

          {errorMsg && (
            <Alert severity="error" sx={{ fontSize: 12, py: 0.25 }}>{errorMsg}</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={isPending} sx={{ textTransform: "none", color: subtleText, fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={confirming ? "error" : "primary"}
          disabled={!isValid || unchanged || isPending || !sequence}
          onClick={handleSubmit}
          startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {isPending ? "Updating…" : confirming ? "Confirm update" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Typography sx={{ fontSize: 12.5, color: subtleText }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: strong ? 13.5 : 12.5,
          fontWeight: strong ? 800 : 700,
          color: headingText,
          fontFamily: "monospace",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function labelFor(docType: DocType): string {
  return ADJUSTABLE.find((o) => o.value === docType)?.label ?? docType;
}
