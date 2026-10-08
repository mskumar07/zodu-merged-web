import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BranchId, ZoduId } from '@store/slices/userSlice';
import type { UseLabelDataSource, PickerItem } from '@components/LabelPrint/PrintLabelModal';
import {
  useInfiniteRestaurantMenu, useInfiniteRestaurantCategories,
  type RestaurantMenuListItem,
} from './restaurantMenuApi';

const toPicker = (m: RestaurantMenuListItem): PickerItem => ({
  id: m.menu_id,
  code: m.menu_code,
  name: m.menu_name,
  price: Number(m.sell_price) || 0,
  category: m.category,
});

/** Feeds the shared label-print modal from the Restaurant menu API. */
export const useRestaurantLabelSource: UseLabelDataSource = ({ search, categoryId }) => {
  const zoduId = useSelector(ZoduId) ?? '';
  const branchId = useSelector(BranchId) ?? '';

  const categoryIds = useMemo(() => (categoryId === '' ? undefined : [categoryId]), [categoryId]);
  // No menuType, like the screen's "All Items" tab, so an unfiltered open reuses its cached list.
  const q = useInfiniteRestaurantMenu(zoduId, branchId, search, undefined, categoryIds);
  const items = useMemo(() => q.data?.pages.flatMap((p) => p.data.map(toPicker)) ?? [], [q.data]);

  const cat = useInfiniteRestaurantCategories(zoduId, branchId, undefined);
  const categories = useMemo(
    () => cat.data?.pages.flatMap((p) => p.data).map((c) => ({ value: c.id, label: c.name })) ?? [],
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
    total: q.data?.pages[0]?.pagination.total_count,
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
