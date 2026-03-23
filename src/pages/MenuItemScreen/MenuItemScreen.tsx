/**
 * MenuItemScreen.tsx
 * ─────────────────────────────────────────────────────────────
 * Optimisations applied:
 *  1. INSTANT EDIT  — modal opens immediately with list-row data.
 *                     useMenuItemDetail fetches fresh data in the
 *                     background and silently updates the form via
 *                     enableReinitialize.  No 10-25s wait.
 *  2. DEBOUNCED SEARCH — 400 ms debounce; no query fires on every
 *                     keystroke.
 *  3. MEMOISED ROWS — products array only recalculates when data
 *                     pages change.  Row component is React.memo'd
 *                     in ProductTable so unchanged rows skip render.
 *  4. QUERY INVALIDATION on save — instead of refetch() which
 *                     resets the whole list, invalidateQueries lets
 *                     TanStack refetch in the background while the
 *                     stale list stays visible.
 *  5. STABLE CALLBACKS — all handlers are useCallback so child
 *                     components don't re-render due to new fn refs.
 */
import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment,
  CircularProgress, Alert, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon    from '@mui/icons-material/Add';
import {
  QueryClient, QueryClientProvider, useQueryClient,
} from '@tanstack/react-query';
import ProductTabs from './components_ProductTabs';
import ProductTable from './components_ProductTable';
import AddItemModal from './AddItemModal';
import {
  useInfiniteMenuItems,
  useMenuItemDetail,
  menuQueryKeys,
  type MenuItem as MenuItemData,
  type MenuItemListParams,
  type AddMenuItemResponse,
} from './useMenuItemApi';

// ─── QueryClient (hoist above this if already provided) ───────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function MenuItemScreenRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <MenuItemScreen />
    </QueryClientProvider>
  );
}

type TabValue = 'all' | 'sellable' | 'raw';

// ── Map a raw MenuItem to the Product shape the table expects ──
// Kept outside the component so it's never recreated.
function toProduct(item: MenuItemData) {
  return {
    id:        item.item_id,
    item_uuid: item.item_uuid,
    name:      item.item_name,
    category:  item.category_name    ?? '—',
    mrp:       Number(item.mrp)      || 0,
    rate:      Number(item.sell_price) || 0,
    taxType:   item.gst_rate ? `GST ${item.gst_rate}%` : '—',
    inclusion: item.tax_incl_type ? 'Inclusive' : 'Exclusive',
    hsn:       item.hsn_code         ?? '—',
    unit:      item.unit_short_name  ?? '—',
    imageUrl:  item.item_img         ?? '',
    status:    item.status,
    _raw:      item,   // kept for instant-edit pre-fill
  };
}

// ─── Screen ───────────────────────────────────────────────────
function MenuItemScreen() {

  // ── Filter state ───────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<TabValue>('all');
  const [searchInput,  setSearchInput]  = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');

  // ── Modal state ────────────────────────────────────────────
  const [modalOpen,    setModalOpen]    = useState(false);
  // editItem holds the list-row snapshot for instant pre-fill
  const [editItem,     setEditItem]     = useState<MenuItemData | null>(null);

  // ── Debounce search — 400 ms ───────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 400);
  }, []);
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // ── Sentinel ref for IntersectionObserver ─────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Query params (stable reference via useMemo) ────────────
  const queryParams = useMemo<Omit<MenuItemListParams, 'page'>>(() => ({
    search:    searchQuery || undefined,
    item_type: activeTab === 'sellable' ? 'S'
             : activeTab === 'raw'      ? 'P'
             : undefined,
    status:    'active',
    limit:     30,
  }), [activeTab, searchQuery]);

  // ── Infinite list query ────────────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useInfiniteMenuItems(queryParams);

  // ── Background detail fetch for edit — fires only when
  //    editItem is set; silently refreshes the already-open form ─
  const { data: freshEditItem } = useMenuItemDetail(
    editItem?.item_uuid ?? null
  );

  // ── QueryClient for targeted cache invalidation ────────────
  const qc = useQueryClient();

  // ── IntersectionObserver ───────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Flatten pages → products (memo — only on data change) ──
  const products = useMemo(
    () => (data?.pages ?? []).flatMap(p => p.data.map(toProduct)),
    [data]
  );

  const totalItems = data?.pages[0]?.total ?? 0;

  // ── Handlers (all stable via useCallback) ──────────────────

  const handleTabChange = useCallback((val: TabValue) => {
    setActiveTab(val);
    setSearchQuery('');
    setSearchInput('');
  }, []);

  const handleEditClick = useCallback((item: MenuItemData) => {
    // INSTANT: open modal immediately with list-row data.
    // useMenuItemDetail will fetch fresh data in background and
    // AddItemModal's enableReinitialize will silently update the form.
    setEditItem(item);
    setModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditItem(null);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    // Small delay before clearing editItem so modal close animation
    // doesn't flash blank form content
    setTimeout(() => setEditItem(null), 300);
  }, []);

  const handleSave = useCallback((_data: AddMenuItemResponse) => {
    // Invalidate list cache — TanStack refetches in background,
    // stale list stays visible (no full reset / blank screen)
    qc.invalidateQueries({ queryKey: ['menu', 'items'] });
    setModalOpen(false);
    setTimeout(() => setEditItem(null), 300);
  }, [qc]);

  // Use fresh detail data when available, fall back to list snapshot
  const activeEditItem = freshEditItem ?? editItem;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', p: 1 }}>

      {/* ── Tabs ── */}
      <ProductTabs value={activeTab} onChange={handleTabChange} />

      {/* ── Filter bar ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name, ID or barcode…"
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              setSearchQuery(searchInput);
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 1.5, fontSize: 13 },
          }}
          sx={{ flex: 1, minWidth: 220, maxWidth: 380 }}
        />

        <Box sx={{ flex: 1 }} />

        {!isLoading && totalItems > 0 && (
          <Chip
            label={`${products.length.toLocaleString()} / ${totalItems.toLocaleString()}`}
            size="small"
            sx={{ fontSize: 12, fontWeight: 600, bgcolor: 'action.hover' }}
          />
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            borderRadius: 1.5, fontWeight: 700, textTransform: 'none',
            fontSize: 13, height: 36,
            boxShadow: '0 4px 12px rgba(210,18,46,0.25)',
          }}>
          Add Item
        </Button>
      </Box>

      {/* ── Error ── */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load items. Please try again.
        </Alert>
      )}

      {/* ── Initial skeleton ── */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {/* ── Table ─────────────────────────────────────────────
           ProductTable rows are React.memo'd — only changed rows
           re-render when new pages arrive. ── */}
      {!isLoading && (
        <ProductTable
          products={products}
          onEdit={p => handleEditClick((p as any)._raw as MenuItemData)}
          onDelete={p => console.log('delete', p.id)}
        />
      )}

      {/* ── Infinite scroll sentinel ── */}
      <Box
        ref={sentinelRef}
        sx={{
          height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mt: 1,
        }}
      >
        {isFetchingNextPage && <CircularProgress size={22} thickness={3} />}
        {!hasNextPage && !isLoading && products.length > 0 && (
          <Typography variant="caption" color="text.disabled" fontWeight={500}>
            ✓ All {totalItems.toLocaleString()} items loaded
          </Typography>
        )}
      </Box>

      {/* ── Add / Edit modal ──────────────────────────────────
           - Create: editItem = null, opens blank form
           - Edit:   editItem = list snapshot → instant open,
                     activeEditItem upgrades to fresh API data
                     once background fetch completes            ── */}
      <AddItemModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        editItem={modalOpen ? activeEditItem : null}
      />
    </Box>
  );
}