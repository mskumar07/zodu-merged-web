import { useCallback, useMemo } from 'react';
import type { UseLabelDataSource, PickerItem } from '@components/LabelPrint/PrintLabelModal';
import {
  useInfiniteMenuItems, useInfiniteCategories,
  type MenuItem, type MenuItemListParams,
} from './useMenuItemApi';

const toPicker = (m: MenuItem): PickerItem => ({
  id: m.item_uuid,
  code: m.item_id,
  barcode: m.barcode,
  name: m.item_name,
  price: Number(m.sell_price) || 0,
  category: m.category_name,
});

/** Feeds the shared label-print modal from the Retail menu-items API. */
export const useRetailLabelSource: UseLabelDataSource = ({ search, categoryId }) => {
  // Same params (and key order) as the table's default query, so with no filter
  // applied this reuses the list the screen already fetched — no extra request.
  const params = useMemo<Omit<MenuItemListParams, 'page'>>(() => ({
    search: search || undefined,
    category_ids: categoryId === '' ? undefined : [categoryId],
    status: 'active',
    limit: 40,
  }), [search, categoryId]);

  const q = useInfiniteMenuItems(params);
  const items = useMemo(() => q.data?.pages.flatMap((p) => p.data.map(toPicker)) ?? [], [q.data]);

  const cat = useInfiniteCategories('product');
  const categories = useMemo(
    () => cat.data?.pages.flatMap((p) => p.categories).map((c) => ({ value: Number(c.value), label: c.label })) ?? [],
    [cat.data],
  );

  const { fetchNextPage } = q;
  const loadMore = useCallback(async () => {
    const res = await fetchNextPage();
    return {
      items: res.data?.pages.flatMap((p) => p.data.map(toPicker)) ?? [],
      hasNextPage: !!res.hasNextPage,
    };
  }, [fetchNextPage]);

  const { fetchNextPage: fetchMoreCategories } = cat;
  return {
    items,
    total: q.data?.pages[0]?.total,
    isLoading: q.isLoading,
    hasNextPage: !!q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
    fetchNextPage: loadMore,
    categories,
    categoriesHasNext: !!cat.hasNextPage,
    categoriesFetching: cat.isFetchingNextPage,
    fetchMoreCategories: () => { fetchMoreCategories(); },
  };
};
