import { Typography } from '@mui/material';
import type { ColumnDef } from '@utils/DataTable';

/** A table row plus the S.No and the pinned-total flag the list table adds. */
export type ListRow<T> = T & { sno: number | string; isTotal?: boolean };

export const money = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}-${m}-${y}` : iso;
};

export const cellText = (bold = false, muted = false) => ({
  fontSize: 13, fontWeight: bold ? 700 : 400, whiteSpace: 'nowrap' as const,
  color: muted ? '#94A3B8' : '#0F172A',
});

export function snoColumn<T>(): ColumnDef<ListRow<T>> {
  return {
    key: 'sno', label: 'S.No', width: 80,
    render: (r) => <Typography sx={cellText(r.isTotal)}>{r.isTotal ? 'Total' : r.sno}</Typography>,
  };
}

/** A left-aligned text column. */
export function textColumn<T>(
  key: keyof T & string, label: string, width: number,
  opts: { grow?: boolean; bold?: boolean; totalLabel?: boolean; oneLine?: boolean } = {},
): ColumnDef<ListRow<T>> {
  return {
    key, label, ...(opts.grow ? { minWidth: width } : { width }),
    render: (r) => {
      const value = r.isTotal ? (opts.totalLabel ? 'Total' : '') : String(r[key] ?? '');
      return (
        // `oneLine` keeps the value on one line (ellipsis + tooltip if it still can't fit); otherwise text
        // wraps inside its own column instead of running under the next one (columns are fixed-width).
        <Typography
          title={opts.oneLine ? value : undefined}
          sx={{
            ...cellText(opts.bold || (opts.totalLabel && r.isTotal)),
            ...(opts.oneLine
              ? { overflow: 'hidden', textOverflow: 'ellipsis' }
              : { whiteSpace: 'normal', overflowWrap: 'anywhere' }),
          }}
        >
          {value}
        </Typography>
      );
    },
  };
}

/** A right-aligned whole-number column (counts, quantities). */
export function intColumn<T>(key: keyof T & string, label: string, minWidth = 100): ColumnDef<ListRow<T>> {
  return {
    key, label, align: 'right', minWidth,
    render: (r) => <Typography sx={cellText(r.isTotal)}>{String(r[key] ?? 0)}</Typography>,
  };
}

export function dateColumn<T>(key: keyof T & string, label: string, width = 130): ColumnDef<ListRow<T>> {
  return {
    key, label, width,
    render: (r) => <Typography sx={cellText()}>{r.isTotal ? '' : fmtDate(String(r[key] ?? ''))}</Typography>,
  };
}

/** A right-aligned amount column; zero amounts are dimmed so the real figures stand out. */
export function moneyColumn<T>(
  key: keyof T & string, label: string, minWidth = 120, bold = false, group?: string,
): ColumnDef<ListRow<T>> {
  return {
    key, label, align: 'right', minWidth, group,
    render: (r) => {
      const v = Number(r[key] ?? 0);
      return <Typography sx={cellText(r.isTotal || bold, !r.isTotal && v === 0)}>{money(v)}</Typography>;
    },
  };
}
