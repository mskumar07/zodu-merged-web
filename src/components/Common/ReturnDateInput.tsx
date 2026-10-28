import { memo, useState } from "react";
import { TextField, type SxProps, type Theme } from "@mui/material";
import { localDateStr } from "@utils/localDate";

/**
 * State for a return / credit-note / debit-note date.
 *
 * The date can't fall before the original invoice or purchase (`minDate`), but it may be today
 * or any later day. Until the user picks one the date simply follows its default — the saved date
 * when editing, otherwise today — raised to `minDate`. Deriving it (instead of copying it into
 * state in an effect) keeps it correct when the invoice loads after the dialog has mounted.
 */
export function useReturnDate(minDate?: string, initial?: string) {
  const [picked, setPicked] = useState<string | null>(null);

  const fallback = initial ?? localDateStr();
  const date = picked ?? (minDate && fallback < minDate ? minDate : fallback);
  // "YYYY-MM-DD" strings order the same as the dates they name.
  const valid = !!date && (!minDate || date >= minDate);

  return { date, setDate: setPicked, valid };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  sx?: SxProps<Theme>;
}

/** Date input that blocks (and flags) dates earlier than `minDate`. */
export const ReturnDateInput = memo(function ReturnDateInput({ value, onChange, minDate, sx }: Props) {
  const tooEarly = !!minDate && !!value && value < minDate;
  return (
    <TextField
      size="small" fullWidth type="date" value={value}
      onChange={(e) => onChange(e.target.value)}
      error={tooEarly || !value}
      helperText={tooEarly ? "Can't be before the invoice date" : !value ? "Select a date" : undefined}
      inputProps={{ min: minDate }}
      sx={sx}
    />
  );
});
