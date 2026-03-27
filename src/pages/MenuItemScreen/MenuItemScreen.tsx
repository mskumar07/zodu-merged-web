import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import {
  Box, TextField, Button, InputAdornment, Alert, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {
  QueryClient, QueryClientProvider, useQueryClient,
} from '@tanstack/react-query';
import ProductTabs from './components_ProductTabs';
import ProductTable from './components_ProductTable';
import AddItemModal from './AddItemModal';
import {
  useInfiniteMenuItems,
  useMenuItemDetail,
  type MenuItem as MenuItemData,
  type MenuItemListParams,
  type AddMenuItemResponse,
} from './useMenuItemApi';

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
  const isFetchingRef = useRef(false);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemData | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 400);
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

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
    isError,
  } = useInfiniteMenuItems(queryParams);

  const { data: freshEditItem } = useMenuItemDetail(editItem?.item_uuid ?? null);

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
      {
        threshold: 1,
        root: tableContainerRef.current,
        rootMargin: '0px 0px 100px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, productsLength(data)]);

  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data.map(toProduct));
  }, [data]);

  const totalItems = data?.pages[0]?.total ?? 0;

  const handleTabChange = useCallback((val: TabValue) => {
    setActiveTab(val);
    setSearchQuery('');
    setSearchInput('');
  }, []);

  const handleEditClick = useCallback((item: MenuItemData) => {
    setEditItem(item);
    setModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditItem(null);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setEditItem(null), 300);
  }, []);

  const handleSave = useCallback((_data: AddMenuItemResponse) => {
    qc.invalidateQueries({ queryKey: ['menu', 'items'] });
    setModalOpen(false);
    setTimeout(() => setEditItem(null), 300);
  }, [qc]);

  const handleEditFromDialog = useCallback((item_uuid: string) => {
    setEditItem({ item_uuid } as MenuItemData);
    setModalOpen(true);
  }, []);

  const activeEditItem = freshEditItem ?? editItem;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ProductTabs value={activeTab} onChange={handleTabChange} />

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap',px:1 }}>
        <TextField
          size="small"
          placeholder="Search by name, ID or barcode..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={(e) => {
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
            sx: { borderRadius: 0.5, fontSize: 13 },
          }}
           sx={{ flex: 1, minWidth: 220,backgroundColor:"#fff" }}
        />


        {/* {!isLoading && totalItems > 0 && (
          <Chip
            label={`${products.length.toLocaleString()} / ${totalItems.toLocaleString()}`}
            size="small"
            sx={{ fontSize: 12, fontWeight: 600, bgcolor: 'action.hover' }}
          />
        )} */}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            borderRadius: 0.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: 13,
            width:150,
            height: 36,
            boxShadow: '0 4px 12px rgba(210,18,46,0.25)',
          }}
        >
          Add Item
        </Button>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load items. Please try again.
        </Alert>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          p:1,
        }}
      >
        {!isLoading && (
          <ProductTable
            products={products}
            onEdit={(p) => handleEditClick((p as any)._raw as MenuItemData)}
            onDelete={(p) => console.log('delete', p.id)}
            onEditFromDialog={handleEditFromDialog}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            loadMoreRef={sentinelRef}
            tableContainerRef={tableContainerRef}
            maxHeight="100%"
          />
        )}
      </Box>

      <AddItemModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        editItem={modalOpen ? activeEditItem : null}
      />
    </Box>
  );
}

function productsLength(data: ReturnType<typeof useInfiniteMenuItems>['data']) {
  return data?.pages.reduce((count, page) => count + page.data.length, 0) ?? 0;
}
