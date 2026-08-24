import React, { useState } from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

interface HardwareScannerInputProps {
  /** Called with the scanned code once Enter is pressed and the value clears minLength. */
  onScan: (code: string) => void;
  placeholder?: string;
  /** Codes shorter than this (after trim) are treated as stray input and ignored. Default 3. */
  minLength?: number;
  /** Clear the field after a successful scan. Default true. */
  clearOnScan?: boolean;
  disabled?: boolean;
  size?: TextFieldProps['size'];
  sx?: TextFieldProps['sx'];
}

// Hardware USB/Bluetooth barcode scanners behave like a keyboard: they type the
// code's characters rapidly, then send an Enter keystroke. This is a plain,
// user-focusable text input — it never grabs focus on its own, so it won't
// interrupt typing anywhere else on the page. The scanner (or the user) simply
// needs this field focused when a code is scanned.
const HardwareScannerInput: React.FC<HardwareScannerInputProps> = ({
  onScan,
  placeholder = 'Click here, then scan…',
  minLength = 3,
  clearOnScan = true,
  disabled = false,
  size = 'small',
  sx,
}) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const code = value.trim();
    if (code.length < minLength) {
      // Stray/short input (e.g. an accidental Enter) — ignore, don't fire onScan.
      if (clearOnScan) setValue('');
      return;
    }
    onScan(code);
    if (clearOnScan) setValue('');
  };

  return (
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      size={size}
      disabled={disabled}
      autoComplete="off"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <QrCodeScannerIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
      sx={sx}
    />
  );
};

export default HardwareScannerInput;
