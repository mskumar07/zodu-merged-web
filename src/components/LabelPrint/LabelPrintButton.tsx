import { useState } from 'react';
import { Button, Tooltip, type ButtonProps } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintLabelModal, { type UseLabelDataSource } from './PrintLabelModal';

/**
 * Drop-in "Label Print" button + modal for any business type. Pass the hook that
 * feeds it items (see the Retail and Restaurant menu screens for examples).
 * `iconOnly` drops the text (with a tooltip instead) where a toolbar is short of room.
 */
export default function LabelPrintButton(
  { useDataSource, sx, iconOnly = false }: { useDataSource: UseLabelDataSource; sx?: ButtonProps['sx']; iconOnly?: boolean },
) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip title={iconOnly ? 'Label Print' : ''}>
        <Button
          variant="outlined" startIcon={iconOnly ? undefined : <QrCode2Icon />} onClick={() => setOpen(true)}
          aria-label="Label Print"
          sx={{
            borderRadius: 0.5, fontWeight: 700, px: iconOnly ? 1.25 : 2, minWidth: iconOnly ? 0 : undefined,
            height: 40, textTransform: 'none', fontSize: 13,
            whiteSpace: 'nowrap', flexShrink: 0, color: '#D2122E', borderColor: '#D2122E',
            '&:hover': { borderColor: '#b00f26', bgcolor: '#FFF1F2' },
            ...sx,
          }}
        >
          {iconOnly ? <QrCode2Icon sx={{ fontSize: 20 }} /> : 'Label Print'}
        </Button>
      </Tooltip>
      <PrintLabelModal open={open} onClose={() => setOpen(false)} useDataSource={useDataSource} />
    </>
  );
}
