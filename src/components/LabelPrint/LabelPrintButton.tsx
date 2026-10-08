import { useState } from 'react';
import { Button, type ButtonProps } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintLabelModal, { type UseLabelDataSource } from './PrintLabelModal';

/**
 * Drop-in "Label Print" button + modal for any business type. Pass the hook that
 * feeds it items (see the Retail and Restaurant menu screens for examples).
 */
export default function LabelPrintButton(
  { useDataSource, sx }: { useDataSource: UseLabelDataSource; sx?: ButtonProps['sx'] },
) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outlined" startIcon={<QrCode2Icon />} onClick={() => setOpen(true)}
        sx={{
          borderRadius: 0.5, fontWeight: 700, px: 2, height: 40, textTransform: 'none', fontSize: 13,
          whiteSpace: 'nowrap', flexShrink: 0, color: '#D2122E', borderColor: '#D2122E',
          '&:hover': { borderColor: '#b00f26', bgcolor: '#FFF1F2' },
          ...sx,
        }}
      >
        Label Print
      </Button>
      <PrintLabelModal open={open} onClose={() => setOpen(false)} useDataSource={useDataSource} />
    </>
  );
}
