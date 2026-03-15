import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BranchId } from "@store/slices/userSlice";
import { useGetAllMenuItemsQuery } from "../store/services/menuApi";
import type { MenuCategory, MenuItem } from "../types/menuItem";

interface menuList {
  name: string;
  value: string;
}

interface Pagination {
  current_page: number;
  limit: number;
  total_count: number;
  total_pages: number;
}

// Hook return type
interface UseMenuItemsResult {
  menuItems: MenuCategory[];
  menuItemsLoading: boolean;
  loading: boolean;
  menuList: menuList[];
  pagination: Pagination;
  onChangePage: (page: number) => void;
}

const flattenMenuList = (menuCategory: MenuCategory[]): menuList[] => {
  return menuCategory.flatMap((category: MenuCategory) =>
    category.items.map((item: MenuItem) => ({
      name: item.menu_name,
      value: item.menu_name,
    }))
  );
};


const useMenuItems = (
  searchTerm: string = "",
  initialPage: number = 1,
  pageSize: number = 15
): UseMenuItemsResult => {
  const [page, setPage] = useState(initialPage);
  const branchId = useSelector(BranchId);
  // 👇 Make RTK Query update when "page" changes
  const {
    data,
    isLoading: isMenuItemsLoading,
    isFetching,
    refetch,
  } = useGetAllMenuItemsQuery({
    branchId: branchId,
    searchTerm,
    page,
    pageSize,
  });

  const [menuItems, setMenuItems] = useState<MenuCategory[]>([]);
  const [menuList, setMenuList] = useState<menuList[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: initialPage,
    limit: pageSize,
    total_count: 0,
    total_pages: 1,
  });

  // 📌 Append / Replace items based on page
  useEffect(() => {
    if (data?.data) {
      setMenuItems((prev) =>
        page === 1 ? data.data : [...prev, ...data.data]
      );

      setMenuList(flattenMenuList(data.data));

      if (data.pagination) {
        setPagination({
          current_page: data.pagination.current_page,
          limit: data.pagination.limit,
          total_count: data.pagination.total_count,
          total_pages: data.pagination.total_pages,
        });
      }
    }
  }, [data]);

  // 🌟 Called by infinite scroll
  const onChangePage = (nextPage: number) => {
    console.log("Changing page to:", nextPage);
    if (nextPage < pagination.total_pages) {
      setPage(nextPage); // RTK Query will refetch automatically
    }
  };

  // 🔄 Reset when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return {
    menuItems,
    menuItemsLoading: isMenuItemsLoading,
    loading: isFetching,
    menuList,
    pagination,
    onChangePage,
  };
};

export default useMenuItems;
