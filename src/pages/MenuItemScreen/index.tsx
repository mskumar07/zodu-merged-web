import React, { useCallback, useState, useEffect } from "react";
import { Button, Box, TextField } from "@mui/material"; // Removed Autocomplete
import type { MenuItem } from "../../types/menuItem";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import AddMenuDrawer from "@components/MenuItemTable/AddMenuDrawer";
import MenuItemsTable from "@components/MenuItemTable";
import AddItemModal from "@components/AddItemModal";
import MenuItemViewModal from "@components/ItemViewModal/MenuItemViewModal";
import useMenuItems from "@hooks/useMenuItems";
import useDebounce from "@hooks/useDebounce";
import {
  useDeleteMenuItemMutation,
  useUpdateMenuFavoriteMutation,
  useUpdateMenuStatusMutation,
} from "@store/services/menuApi";
import TextInput from "@components/TextInput"; // Added TextInput
import DeleteConfirmModal from "@components/DeleteMenuModal";
import { toast } from "react-toastify";
import { messageConstant } from "@config/messageConstants";



export interface MenuItemFormValues {
  menu_name: string;
  sell_price: string;
  totalPrice: string;
  gst_id:string;
  gst_tax: string;
  menu_image: File |string | null;
  purchase_price: string;
  menu_category: string;
  variants: { variant_name: string; price: string, id:string }[];
  menu_type: "Product" | "Food";
  menu_unit: string;
  food_type: "Veg" | "NonVeg";
  item_code: string;
  hsn_code: string;
  tax_include_or_exclude: boolean;
  menu_id?: string;
}

// Z-T71 initial form values
const initialValues: MenuItemFormValues = {
  menu_name: "",
  sell_price: "",
  totalPrice: "",
  gst_tax: "",
  menu_image: null,
  purchase_price: "",
  menu_category: "",
  variants: [],
  menu_type: "Product",
  menu_unit: "",
  food_type: "Veg",
  item_code: "",
  hsn_code: "", // Added HSN Code field
  tax_include_or_exclude: false,
  menu_id: "", // Optional menu_id for editing existing items
};

const MenuItemsScreen: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 600);
  const { menuItems,menuItemsLoading, loading, menuList, pagination, onChangePage } = useMenuItems(debouncedSearch); // Pass searchValue to hook
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerFormValues, setDrawerFormValues] =
    useState<MenuItemFormValues>(initialValues);
  const [updateMenuStatus] = useUpdateMenuStatusMutation();
  const [updateMenuFavorite] = useUpdateMenuFavoriteMutation();

  // 🔹 Load items from hook (fallback to initialItems)
  useEffect(() => {
    if (menuItems && pagination?.current_page === 1) {
      setItems(menuItems);
    } else if (menuItems) {
      //append new items (next page)
      setItems(menuItems);
    }
  }, [menuItems, pagination?.current_page]);

  const handleRowClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  }, []);

  const handleAddItem = useCallback(() => {
    setDrawerFormValues(initialValues); // Reset to default for adding
    setDrawerOpen(true);
  }, []);

  const handleEditItem = useCallback((item: MenuItem) => {
    // Here you would map the 'item' to the 'MenuItemFormValues' structure.

   
    const editValues: MenuItemFormValues = {
      ...initialValues, // Start with default to ensure all fields are present
      menu_name: item.menu_name || "",
      sell_price: item.sell_price?.toString() || "",
      purchase_price:
        item.purchase_price === "NULL" ? "" : item.purchase_price || "",
      gst_tax: item.gst_id || "",
      menu_type: (item.menu_type === "Product" || item.menu_type === "Food")
        ? item.menu_type
        : "Product", // Ensure it's "Product" or "Food"
      food_type: (item.food_type === "Veg" || item.food_type === "NonVeg")
        ? item.food_type
        : "Veg", // Ensure it's "Veg" or "NonVeg"
      menu_unit: item.unit_id || "",
      item_code: item.menu_id || "", // Assuming item_code is the menu_id
      hsn_code: item.hsn_code || "",
      tax_include_or_exclude: item.tax_include_or_exclude === null ? false: item.tax_include_or_exclude, // Convert string to boolean
      variants: item.variants ? item.variants.map((variant, index) => ({ ...variant , variant_name: variant.variant_name, price: variant.price })):[], // Map variants
      menu_id: item.menu_id || "",
      menu_category: item.category_id || "",
      menu_image: item.menu_image || null,
      // menu_image is tricky since it's a URL and the form expects a File object.
      // For an edit form, you might show the existing image and allow replacement.
    };
    setDrawerFormValues(editValues);
    setDrawerOpen(true);
  }, []);

  const handleDeleteItem = useCallback((item: MenuItem) => {
    // setItems((prev) => prev.filter((i) => i.menu_id !== item.menu_id));
    setSelectedItem(item);
    setDeleteModalOpen(true);
  }, []);

  const toggleStatus = async (item: MenuItem) => {
    try {
      // Toggle the current active status
      const newStatus = !item.active;

      // Call your API mutation (e.g., useUpdateMenuStatusMutation)
      await updateMenuStatus({ menuId: item.menu_id, menu_status: newStatus });

      // Update local state immediately for UI feedback
      setItems((prev) =>
        prev.map((i) =>
          i.menu_id === item.menu_id ? { ...i, active: newStatus } : i
        )
      );
    } catch (error) {
      console.error("Failed to update menu status:", error);
    }
  };

  const toggleFav = async (item: MenuItem) => {
    try {
      // Toggle the current active status
      const newStatus = !item.favorites;

      // Call your API mutation (e.g., useUpdateMenuStatusMutation)
      await updateMenuFavorite({ menuId: item.menu_id, favorite: newStatus });

      // Update local state immediately for UI feedback
      setItems((prev) =>
        prev.map((i) =>
          i.menu_id === item.menu_id ? { ...i, favorites: newStatus } : i
        )
      );
    } catch (error) {
      console.error("Failed to update menu fav:", error);
    }
  };

  // Removed local filtering as it will be handled by the API
  // --- Form logic below unchanged ---
  const [formData, setFormData] = useState({
    type: "Product",
    menuName: "",
    vegType: "Veg",
    sellPrice: "",
    totalPrice: "",
    withTax: "WithTax",
    taxRate: "",
    itemUnit: "",
    purchasePrice: "",
    category: "",
    variant: "",
  });

  const [categories, setCategories] = useState([
    "Beverages",
    "Snacks",
    "Desserts",
  ]);
  const paymentMethods = ["Cash", "Card", "UPI"];
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMenuItem,{isLoading:isDeleting, isError:deleteError}] = useDeleteMenuItemMutation()

  const handleConfirmDelete = async() => {
    try{
      await deleteMenuItem(selectedItem?.menu_id || "");
      setDeleteModalOpen(false);
      toast.success(messageConstant.success.MENU_DELETED);
    }catch(e){

      toast.error(messageConstant.failure.MENU_DELETE_FAILED);
    }
  }

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev) => {
      let updated = { ...prev, [field]: value };
      if (field === "sellPrice" || field === "taxRate" || field === "withTax") {
        const sellPriceNum = parseFloat(updated.sellPrice) || 0;
        const taxRateNum = parseFloat(updated.taxRate) || 0;
        updated.totalPrice =
          updated.withTax === "WithTax"
            ? (sellPriceNum + (sellPriceNum * taxRateNum) / 100).toFixed(2)
            : sellPriceNum.toFixed(2);
      }
      return updated;
    });
  };

  const handleSelectChange = (event: any, field: any) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setFormData((prev) => ({ ...prev, category: trimmed }));
      setNewCategoryName("");
      setAddCategoryOpen(false);
    }
  };

  const handleSubmit = () => {
    console.log("Form Data Submitted:", formData);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        <TextInput
          name="search" // Added name prop
          placeholder="Search by menu name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ width: 300, mr: 2 }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: "action.active", mr: 1 }} />
            ),
          }}
        />
        <Box sx={{ flexGrow: 1, width:"250px", }} />
        <Box sx={{
          width:"20%",
          display:"flex",
          justifyContent:"center",
          alignItems:"center"
        }}>
        <Button
          variant="contained"
          disableElevation
          onClick={handleAddItem}
          sx={{
            // display: "flex",
            // alignItems: "center",
            gap: 1,
            padding:"12px !important",
            height:"auto",
            width:"60%",
            bgcolor: "#dc2626",
            "&:hover": { bgcolor: "#b91c1c" },
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              display: "flex",
              borderRadius: 0.5,
              alignItems: "center",
              justifyContent: "center",
              p: "2px",
            }}
          >
            <AddIcon sx={{ color: "#dc2626", fontSize: 14 }} />
          </Box>
          Add Items
        </Button>
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: "white",
          padding: 2,
          borderRadius: 2,
          height: "80vh",
          // overflowY: "auto",
        }}
      >
        {menuItemsLoading?<p>Loading...</p>:items.length === 0 ? (
          <p>No menu items found.</p>
        ) : items.length > 0 && pagination ? (
          <MenuItemsTable
            items={items}
            pagination={pagination}
            loading={loading}
            onChangePage={onChangePage}
            onRowClick={handleRowClick}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onStatus={toggleStatus}
            onFav={toggleFav}
          />
        ):""}
      </Box>

      <MenuItemViewModal
        open={viewModalOpen}
        item={selectedItem}
        onClose={() => setViewModalOpen(false)}
      />
      <AddMenuDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialValues={drawerFormValues}
        setAddCategoryOpen={setAddCategoryOpen}
        addCategoryOpen={addCategoryOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleAddCategory={handleAddCategory}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

    </Box>
  );
};

export default MenuItemsScreen;
