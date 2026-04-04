import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment,
  CircularProgress, Alert, Chip, Avatar,
  Select, MenuItem, FormControl,
} from '@mui/material';
import SearchIcon        from '@mui/icons-material/Search';
import Inventory2Icon    from '@mui/icons-material/Inventory2';
import TrendingUpIcon    from '@mui/icons-material/TrendingUp';
import WarningAmberIcon  from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon  from '@mui/icons-material/ErrorOutline';
import QrCodeIcon        from '@mui/icons-material/QrCode2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DataTable, { type ColumnDef } from '@utils/DataTable';
import AdjustStockModal from './AdjustStockModal';
import {
  useInventorySummary,
  useInfiniteInventory,
  type InventoryItem,
  type InventoryListParams,
  type StockStatus,
} from './useInventoryApi';
import StockHistoryModal from './StockHistoryModal';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

export default function InventoryScreenRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <InventoryScreen />
    </QueryClientProvider>
  );
}

// ── Formatters ─────────────────────────────────────────────────
const formatINR = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v);
const TABLE_TEXT_COLOR = '#374151';

// ── Stat card ──────────────────────────────────────────────────
interface StatCardProps {
  icon:    React.ReactNode;
  iconBg:  string;
  iconColor?: string;
  label:   string;
  value:   string | number;
  sub?:    React.ReactNode;
}
const StatCard: React.FC<StatCardProps> = ({ icon, iconBg, iconColor, label, value, sub }) => (
  <Box
    sx={{
      width: "auto",
      flex: '0 0 220px',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 2,
      py: 1.8,
      borderRadius: 1,
      border: '1px solid',
      borderColor: '#E5E7EB',
      bgcolor: '#FFFFFF',
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: 1.2,
        bgcolor: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <Typography
        sx={{
          color: '#64748B',
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.2,
          mb: 0.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Typography>
      <Typography
      variant='h6'
        sx={{

          color: '#0F172A',
          fontWeight: 800,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </Typography>
      {/* {sub && <Box sx={{ mt: 0.35 }}>{sub}</Box>} */}
    </Box>
  </Box>
);

// ── Stock status badge ─────────────────────────────────────────
const STATUS_MAP: Record<StockStatus, { label: string; color: string; dot: string }> = {
  in_stock:     { label: 'In Stock',    color: '#16a34a', dot: '#22c55e' },
  low_stock:    { label: 'Low Stock',   color: '#d97706', dot: '#f59e0b' },
  out_of_stock: { label: 'Out Stock',   color: '#dc2626', dot: '#ef4444' },
};

const StatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
  const { label, color, dot } = STATUS_MAP[status] ?? STATUS_MAP.in_stock;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dot }} />
      <Typography variant="body2" fontWeight={600} sx={{ color }}>{label}</Typography>
    </Box>
  );
};

// ── Map row to product function (outside component) ──────────
function toRow(item: InventoryItem) {
  return { ...item, _raw: item };
}

// ─────────────────────────────────────────────────────────────
function InventoryScreen() {
  const [searchInput,   setSearchInput]   = useState('');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [stockFilter,   setStockFilter]   = useState<StockStatus | ''>('');

  // ── Adjust stock modal ─────────────────────────────────────
  const [adjustItem,    setAdjustItem]    = useState<InventoryItem | null>(null);
  const [adjustOpen,    setAdjustOpen]    = useState(false);
const isFetchingRef = useRef(false);
const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
const [historyOpen, setHistoryOpen] = useState(false);

  // ── Sentinel ───────────────────────────────────────────────
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  // ── Debounced search ───────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 400);
  }, []);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // ── Summary query ──────────────────────────────────────────
  const { data: summary, refetch: refetchSummary } = useInventorySummary();

  // ── Infinite list query ────────────────────────────────────
  const queryParams = useMemo<Omit<InventoryListParams, 'page'>>(() => ({
    search:       searchQuery   || undefined,
    stock_status: stockFilter   || undefined,
    limit:        30,
  }), [searchQuery, stockFilter]);

  const {
    data, isLoading, isFetchingNextPage,
    hasNextPage, fetchNextPage, isError, refetch: refetchInventory,
  } = useInfiniteInventory(queryParams);

  // ── IntersectionObserver ───────────────────────────────────

useEffect(() => {
  const el = sentinelRef.current;
  const root = tableContainerRef.current;

  if (!el || !root) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (
        entry.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetchingRef.current
      ) {
        isFetchingRef.current = true;

        fetchNextPage().finally(() => {
          setTimeout(() => {
            isFetchingRef.current = false;
          }, 300);
        });
      }
    },
    {
      root,
      threshold: 1,
      rootMargin: "0px 0px 100px 0px",
    }
  );

  observer.observe(el);
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage, isLoading, data?.pages?.length]);

  const rows = useMemo(() => {
  if (!data?.pages) return [];
  return data.pages.flatMap(p => p.data.map(toRow));
}, [data]);

  const totalItems = data?.pages[0]?.total ?? 0;

  // ── Handlers ───────────────────────────────────────────────
  const handleAdjustClick = useCallback((item: InventoryItem) => {
    setAdjustItem(item);
    setAdjustOpen(true);
  }, []);

  const handleAdjustClose = useCallback(() => {
    setAdjustOpen(false);
    setTimeout(() => setAdjustItem(null), 300);
  }, []);

  const handleOpenHistory = (item: InventoryItem) => {
  setHistoryItem(item);
  setHistoryOpen(true);
};

const handleCloseHistory = () => {
  setHistoryOpen(false);
  setHistoryItem(null);
};

  // ── Table columns ──────────────────────────────────────────
  const columns = useMemo<ColumnDef<InventoryItem & { _raw: InventoryItem }>[]>(() => [
    {
      key: 'item_id', label: 'Item ID',
      render: (r) => (
      <Typography
  variant="body2"
  fontWeight={600}
  sx={{
    color: '#1976d2',
    fontSize: 13,
    cursor: 'pointer',
  }}
  onClick={() => handleOpenHistory(r._raw)}
>
  {r.item_id}
</Typography>
      ),
    },
    {
      key: 'item_name', label: 'Item Name', minWidth: 220,
      render: (r) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={r.item_img ?? ''} variant="rounded" sx={{ width: 38, height: 38, border: '1px solid', borderColor: 'divider' }}>
            {r.item_name[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3, fontSize: 13, color: TABLE_TEXT_COLOR }}>{r.item_name}</Typography>
            <Typography sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, lineHeight: 1.3 }}>
              {r.category_name ?? '—'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'available_qty', label: 'Stock', align: 'center',
      render: (r) => {
        const qty = Number(r.available_qty);
        const isLow = r.stock_status === 'low_stock';
        const isOut = r.stock_status === 'out_of_stock';
        return (
          <Typography variant="body2" fontWeight={700}
            sx={{ fontSize: 13, color: isOut ? 'error.main' : isLow ? '#d97706' : TABLE_TEXT_COLOR }}>
            {qty} {r.unit_short_name ?? ''}
          </Typography>
        );
      },
    },
    {
      key: 'reorder_level', label: 'Low Level', align: 'center',
      render: (r) => (
        <Typography variant="body2" sx={{ fontSize: 13, color: TABLE_TEXT_COLOR }}>
          {Number(r.reorder_level)} {r.unit_short_name ?? ''}
        </Typography>
      ),
    },
    {
      key: 'stock_status', label: 'Status',
      render: (r) => <StatusBadge status={r.stock_status} />,
    },
    {
      key: 'sell_price', label: 'Price', align: 'right',
      render: (r) => (
        <Typography variant="body2" sx={{ fontSize: 13, color: TABLE_TEXT_COLOR }}>
          {r.purchase_price ? formatINR(Number(r.purchase_price)) : '—'}
        </Typography>
      ),
    },
    {
      key: 'stock_value', label: 'Value', align: 'right',
      render: (r) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13, color: TABLE_TEXT_COLOR }}>
          {formatINR(Number(r.stock_value))}
        </Typography>
      ),
    },
    {
      key: 'last_stock_update', label: 'Last Restock',
      render: (r) => (
        <Typography variant="body2" sx={{ fontSize: 13, color: TABLE_TEXT_COLOR, whiteSpace: 'nowrap' }}>
          {r.last_stock_update
            ? new Date(r.last_stock_update).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—'}
        </Typography>
      ),
    },
    {
      key: 'actions', label: 'Actions', align: 'center',
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
          {/* <Tooltip title="Edit item">
            <IconButton size="small" sx={{ color: 'text.disabled', borderRadius: 1.5, '&:hover': { color: 'primary.main' } }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip> */}
          <Button
            size="small" variant="outlined" color="primary"
            onClick={() => handleAdjustClick(r._raw)}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1, px: 1 }}
          >
            Adjust Stock
          </Button>
        </Box>
      ),
    },
  ], [handleAdjustClick]);

  return (
<Box
  sx={{
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    p: 2,
    gap: 2.5,
  }}
>
      {/* ── Stat cards ── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        <StatCard
          icon={<Inventory2Icon sx={{ fontSize: 20 }} />}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
          label="Total Stock Value"
          value={summary ? formatINR(summary.total_stock_value) : '—'}
          sub={<Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Current inventory worth</Typography>}
        />
        <StatCard
          icon={<WarningAmberIcon sx={{ fontSize: 20 }} />}
          iconBg="#FEF3C7"
          iconColor="#D97706"
          label="Low Stock Items"
          value={summary?.low_stock_count ?? '—'}
          sub={<Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Items below reorder level</Typography>}
        />
        <StatCard
          icon={<ErrorOutlineIcon sx={{ fontSize: 20 }} />}
          iconBg="#FEE2E2"
          iconColor="#DC2626"
          label="Out of Stock"
          value={summary?.out_of_stock_count ?? '—'}
          sub={<Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Immediate action required</Typography>}
        />
        <StatCard
          icon={<QrCodeIcon sx={{ fontSize: 20 }} />}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
          label="Total SKUs"
          value={summary?.total_skus?.toLocaleString() ?? '—'}
          sub={<Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Active items in catalog</Typography>}
        />
      </Box>

      {/* ── Filter bar ── */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by Item Name, ID, or Barcode…"
          value={searchInput}
          
          onChange={e => handleSearchChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              setSearchQuery(searchInput);
            }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
            sx: { borderRadius: 0.5, fontSize: 13 },
          }}
          sx={{ flex: 1, minWidth: 260,backgroundColor:"#fff" }}
        />

        {/* Stock status filter */}
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <Select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as StockStatus | '')}
            displayEmpty
            renderValue={v => v
              ? STATUS_MAP[v as StockStatus]?.label
              : <Box component="span" sx={{ color: 'text.disabled' }}>All Status</Box>
            }
            sx={{ borderRadius: 0.5, fontSize: 13,backgroundColor:"#fff" }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="in_stock">In Stock</MenuItem>
            <MenuItem value="low_stock">Low Stock</MenuItem>
            <MenuItem value="out_of_stock">Out of Stock</MenuItem>
          </Select>
        </FormControl>


        {/* {!isLoading && totalItems > 0 && (
          <Chip
            label={`${rows.length.toLocaleString()} / ${totalItems.toLocaleString()}`}
            size="small"
            sx={{ fontSize: 12, fontWeight: 600, bgcolor: 'action.hover' }}
          />
        )} */}
      </Box>

      {/* ── Error ── */}
      {isError && (
        <Alert severity="error">Failed to load inventory. Please try again.</Alert>
      )}

      {/* ── Initial loader ── */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {!isLoading && (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={r => r.inventory_uuid}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            loadMoreRef={sentinelRef}
            tableContainerRef={tableContainerRef}
            maxHeight="100%"
            emptyMessage="No inventory items found."
          />
        )}
      </Box>

      {/* ── Adjust Stock Modal ── */}
      <AdjustStockModal
        open={adjustOpen}
        preselectedItem={adjustItem}
        onClose={handleAdjustClose}
        onSuccess={() => {
          refetchSummary();
          refetchInventory();
        }}
      />

      <StockHistoryModal
  open={historyOpen}
  item={historyItem}
  onClose={handleCloseHistory}
/>
    </Box>
  );
}
