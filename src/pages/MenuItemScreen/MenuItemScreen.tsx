import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import {
  Box, TextField, Button, InputAdornment, Alert,
  Dialog, DialogTitle, DialogContent, Typography, DialogActions,
  FormControl, Select, MenuItem, Checkbox, ListItemText, OutlinedInput,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import {
  QueryClient, QueryClientProvider, useQueryClient, type InfiniteData,
} from '@tanstack/react-query';

import ProductTabs from './components_ProductTabs';
import ProductTable from './components_ProductTable';
import AddItemModal from './AddItemModal';
import CategoryTab from './CategoryTab';

import {
  useInfiniteMenuItems,
  useMenuItemDetail,
  useInfiniteCategories,
  type MenuItem as MenuItemData,
  type MenuItemListParams,
  type MenuItemListResponse,
  type AddMenuItemResponse,
  useHardDeleteMenuItem,
  useUpdateMenuItemStatus,
} from './useMenuItemApi';

const queryClient = new QueryClient();

export default function MenuItemScreenRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <MenuItemScreen />
    </QueryClientProvider>
  );
}

type TabValue = 'all' | 'category' | 'sellable' | 'raw';

function toProduct(item: MenuItemData) {
  return {
    id: item.item_id,
    item_uuid: item.item_uuid,
    name: item.item_name,
    category: item.category_name ?? '-',
    mrp: Number(item.mrp) || 0,
    rate: Number(item.sell_price) || 0,
    purchase_price: Number(item.purchase_price) || 0,
    taxType: item.gst_rate ? `${item.gst_rate}%` : '-',
    inclusion: item.tax_incl_type ? 'Inclusive' : 'Exclusive',
    hsn: item.hsn_code ?? '-',
    unit: item.unit_short_name ?? '-',
    imageUrl: item.item_img ?? '',
    status: item.status,
    _raw: item,
  };
}

function MenuItemScreen() {
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemData | null>(null);

  // 🔥 DELETE STATE
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const catIsFetchingRef = useRef(false);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 400);
  };

  const hasActiveFilters = searchInput !== '' || selectedCategories.length > 0;

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategories([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const {
    data: catPages,
    hasNextPage: catHasNextPage,
    isFetchingNextPage: catIsFetchingNextPage,
    fetchNextPage: catFetchNextPage,
  } = useInfiniteCategories('product');

  const categories = catPages?.pages.flatMap((p) => p.categories) ?? [];

  const handleCatMenuScroll = (e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom && catHasNextPage && !catIsFetchingNextPage && !catIsFetchingRef.current) {
      catIsFetchingRef.current = true;
      catFetchNextPage().finally(() => { catIsFetchingRef.current = false; });
    }
  };

  const queryParams = useMemo<Omit<MenuItemListParams, 'page'>>(() => ({
    search:        searchQuery || undefined,
    category_ids:  selectedCategories.length ? selectedCategories : undefined,
    item_type:     activeTab === 'sellable' ? 'S'
                 : activeTab === 'raw'      ? 'P'
                 : undefined,
    status: 'active',
    limit:  40,
  }), [activeTab, searchQuery, selectedCategories]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteMenuItems(queryParams);

  const { data: freshEditItem } = useMenuItemDetail(editItem?.item_uuid ?? null);

  const { mutate: hardDeleteItem } = useHardDeleteMenuItem({
    onSuccess: async () => {
      // 🔥 CLEAR CACHE + REFETCH
      qc.removeQueries({ queryKey: ['menu', 'items'] });
      await qc.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });

  // 🔥 DELETE HANDLERS
  const openDeleteDialog = (uuid: string) => {
    setDeleteTarget(uuid);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    hardDeleteItem(deleteTarget);
    setDeleteTarget(null);
  };

  const { mutate: updateStatus } = useUpdateMenuItemStatus({
    onSuccess: (_data, variables) => {
      qc.setQueriesData<InfiniteData<MenuItemListResponse>>(
        { queryKey: ['menu', 'items'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item) =>
                item.item_uuid === variables.item_uuid
                  ? { ...item, status: variables.status }
                  : item
              ),
            })),
          };
        }
      );
    },
  });

  // 🔥 INFINITE SCROLL
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

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
      { root: tableContainerRef.current }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data.map(toProduct));
  }, [data]);

  const handleEditClick = (item: MenuItemData) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleSave = (_data: AddMenuItemResponse) => {
    qc.invalidateQueries({ queryKey: ['menu', 'items'] });
    setModalOpen(false);
    setEditItem(null);
  };

  const activeEditItem = freshEditItem ?? editItem;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <ProductTabs value={activeTab} onChange={setActiveTab} />

      {/* ── Category Tab ── */}
      {activeTab === 'category' && (
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <CategoryTab />
        </Box>
      )}

      {/* ── Menu Item / Sellable / Raw Tabs ── */}
      {activeTab !== 'category' && (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search..."
              sx={{ flex: 1, minWidth: 200, bgcolor: '#fff' }}
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 0.5, fontSize: 13 },
              }}
            />

            {/* Category multi-select */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                multiple
                displayEmpty
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(e.target.value as number[])}
                input={<OutlinedInput sx={{ borderRadius: 0.5, fontSize: 13, bgcolor: '#fff' }} />}
                renderValue={(selected) => {
                  if (!(selected as number[]).length)
                    return <Box component="span" sx={{ color: 'text.disabled', fontSize: 13 }}>All Categories</Box>;
                  return (
                    <Box component="span" sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600 }}>
                      {(selected as number[]).length} {(selected as number[]).length === 1 ? 'Category' : 'Categories'}
                    </Box>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 300 },
                    onScroll: handleCatMenuScroll,
                  },
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={Number(cat.value)} sx={{ fontSize: 13 }}>
                    <Checkbox checked={selectedCategories.includes(Number(cat.value))} size="small" sx={{ py: 0 }} />
                    <ListItemText primary={cat.label} primaryTypographyProps={{ fontSize: 13 }} />
                  </MenuItem>
                ))}
                {catIsFetchingNextPage && (
                  <MenuItem disabled sx={{ fontSize: 12, color: 'text.disabled', justifyContent: 'center' }}>
                    Loading...
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Box
                onClick={handleResetFilters}
                title="Reset Filters"
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 1, cursor: 'pointer',
                  bgcolor: '#F97316', color: '#fff',
                  '&:hover': { bgcolor: '#ea6c0a' },
                  flexShrink: 0,
                }}
              >
                <FilterListOffIcon sx={{ fontSize: 20 }} />
              </Box>
            )}

            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}
              sx={{ borderRadius: 0.5, fontWeight: 700, px: 2.5, height: 40, textTransform: 'none', fontSize: 13, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(210,18,46,0.25)' }}>
              Add Item
            </Button>
          </Box>

          {isLoading && <Alert>Loading...</Alert>}

          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <ProductTable
              products={products}
              onEdit={(p) => handleEditClick((p as any)._raw)}
              onDelete={(p) => openDeleteDialog((p as any).item_uuid)}
              onToggleStatus={(p, newStatus) => updateStatus({ item_uuid: p.item_uuid, status: newStatus })}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              loadMoreRef={sentinelRef}
              tableContainerRef={tableContainerRef}
            />
          </Box>

          {/* 🔥 DELETE DIALOG */}
          <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this item?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <AddItemModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            editItem={modalOpen ? activeEditItem : null}
          />
        </>
      )}
    </Box>
  );
}
