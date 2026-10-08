import { Box, Dialog, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { closeFromControlsOnly } from '@utils/dialog';
import type { ColumnDef } from '@utils/DataTable';
import type { ListRow } from './invoiceTableParts';

/**
 * Read-only details for one table row. It lists the tab's own columns, so every
 * tab can offer an eye button without writing a dialog of its own.
 */
export default function RowDetailsDialog<T extends object>({ title, row, columns, onClose }: {
  title: string;
  row: ListRow<T> | null;
  columns: ColumnDef<ListRow<T>>[];
  onClose: () => void;
}) {
  const fields = columns.filter((c) => c.key !== 'sno' && c.key !== 'actions');
  return (
    <Dialog open={!!row} onClose={closeFromControlsOnly(onClose)} fullWidth maxWidth="xs">
      {row && (
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{title}</Typography>
            <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
          </Box>
          {fields.map((c) => (
            <Box key={c.key} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.9, borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#64748B' }}>{c.label}</Typography>
              <Box>{c.render(row)}</Box>
            </Box>
          ))}
        </Box>
      )}
    </Dialog>
  );
}
