import { useEffect, useMemo, useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LottieLoader from '@components/LottieLoader';
import DataTable, { type ColumnDef } from '@utils/DataTable';
import type { ListRow } from './invoiceTableParts';

export interface InvoiceListTableProps<T extends object> {
  emptyMessage: string;
  columns: ColumnDef<ListRow<T>>[];
  rows: T[];
  /** The text a search is matched against. */
  searchText: (row: T) => string;
  rowKey: (row: T) => string;
  /** Lower-cased, trimmed search text; the toolbar beside the tabs owns the box. */
  query: string;
  clientFilter?: boolean;
  /** Infinite scroll: reaching the end of the loaded rows calls `onLoadMore`. */
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  /** Adds an eye button per row (an Actions column) that calls this with the row. */
  onViewRow?: (row: T) => void;
  loading: boolean;
}

/**
 * The table behind every GSTR-1 tab: filters rows by the search query and scrolls the body.
 */
export default function InvoiceListTable<T extends object>({
  emptyMessage, columns, rows, searchText, rowKey, query,
  onViewRow, loading, clientFilter = true, hasNextPage, isFetchingNextPage, onLoadMore,
}: InvoiceListTableProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  const filtered = useMemo(
    () => (clientFilter && query ? rows.filter((r) => searchText(r).toLowerCase().includes(query)) : rows),
    [rows, query, searchText, clientFilter],
  );

  const tableRows = useMemo(
    () => filtered.map((r, i) => ({ ...r, sno: i + 1 }) as ListRow<T>),
    [filtered],
  );

  // The sentinel row sits under the last loaded row; scrolling it into view loads the next page.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !onLoadMore) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && hasNextPage && !isFetchingNextPage) onLoadMore(); },
      { root: tableContainerRef.current, rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore, tableRows.length]);

  const tableColumns = useMemo(() => {
    if (!onViewRow) return columns;
    const actions: ColumnDef<ListRow<T>> = {
      key: 'actions', label: 'Actions', align: 'center', width: 90,
      render: (r) => (
        <Tooltip title="View details" placement="top">
          <IconButton size="small" onClick={() => onViewRow(r)} sx={{ color: '#475569' }}>
            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ),
    };
    return [...columns, actions];
  }, [columns, onViewRow]);

  // First load of a tab: the app's loader instead of an empty table.
  if (loading) return <LottieLoader />;

  return (
    <DataTable<ListRow<T>>
      columns={tableColumns}
      rows={tableRows}
      rowKey={rowKey}
      headerHeight={30}
      hideEndNote
      skeletonRows={10}
      hasNextPage={!!hasNextPage}
      isFetchingNextPage={!!isFetchingNextPage}
      loadMoreRef={sentinelRef}
      tableContainerRef={tableContainerRef}
      maxHeight="100%"
      emptyMessage={query ? 'No records match your search.' : emptyMessage}
    />
  );
}
