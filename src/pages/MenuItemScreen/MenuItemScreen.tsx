import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import {
  Box, TextField, Button, InputAdornment, Alert,
  Dialog, DialogTitle, DialogContent, Typography, DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {
  QueryClient, QueryClientProvider, useQueryClient, type InfiniteData,
} from '@tanstack/react-query';

import ProductTabs from './components_ProductTabs';
import ProductTable from './components_ProductTable';
import AddItemModal from './AddItemModal';

import {
  useInfiniteMenuItems,
  useMenuItemDetail,
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

type TabValue = 'all' | 'sellable' | 'raw';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemData | null>(null);

  // 🔥 DELETE STATE
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 400);
  };

  const queryParams = useMemo<Omit<MenuItemListParams, 'page'>>(() => ({
    search: searchQuery || undefined,
    item_type: activeTab === 'sellable' ? 'S'
      : activeTab === 'raw' ? 'P'
        : undefined,
    status: 'active',
    limit: 40,
  }), [activeTab, searchQuery]);

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column',p:2 }}>
      <ProductTabs value={activeTab} onChange={setActiveTab} />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search..."
          sx={{width:"90%"}}
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
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
    </Box>
  );
}
