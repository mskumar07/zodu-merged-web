//Z-T87
import React, { useCallback, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { BranchId } from "@store/slices/userSlice";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
//Z-T87
import { useGetInventoryListQuery, useUpdateInventoryItemMutation  } from "@store/services/inventoryApi"; // ✅ import hook

import InventoryItemsTable from "@components/InventoryTable";
import InventoryDrawer from "@components/InventoryTable/InventoryDrawer";
import ItemViewModal from "@components/ItemViewModal";
import type { MenuItem } from "../../types/menuItem";



const DirectInventoryScreen: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  //Z-T87
  const [addInventoryItem, { isLoading, isSuccess, isError }] =
    useUpdateInventoryItemMutation(); //Z-T87
    // 👇 Adjust this to the actual branch ID you use in your app
    const branchId = useSelector(BranchId);
    console.log("Branch ID in DirectInventoryScreen:", branchId);
 // Fetch inventory data from API with specific names
const {
  data: inventoryData,
  isLoading: isInventoryLoading,
  isError: isInventoryError,
} = useGetInventoryListQuery({ branchId: branchId , inventoryType: "direct" }); // ✅ use hook with params

// Transform API data to match MenuItem structure
const items: MenuItem[] = useMemo(() => {
  if (!inventoryData) return [];
  return inventoryData.Data.map((inv) => ({
    id: inv.inventory_id.toString(),
    sku: inv.item_id,
    name: inv.item_name,
    category: inv.category_name,
    sellPrice: parseFloat(inv.selling_price) || 0,
    purchasePrice: parseFloat(inv.purchase_price) || 0,
    stock: parseFloat(inv.stock_qty) || 0,
    status: true, // default to true (can modify if API provides status)
    imageUrl: "/images/default-placeholder.png", // placeholder image
    ...inv
  }));
}, [inventoryData]);


  // ✅ Search filter
  const filteredItems = items.filter(
    (item) =>
      item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // ✅ Row click handlers
  const handleRowClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  }, []);

  const handleEditItem = useCallback((item: MenuItem) => {
    console.log("Edit item:", item);
  }, []);

  const handleDeleteItem = useCallback((item: MenuItem) => {
    console.log("Delete item:", item);
  }, []);

  // Form state for Drawer (add new inventory)
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

  const [categories, setCategories] = useState(["Beverages", "Snacks", "Desserts"]);
  const paymentMethods = ["Cash", "Card", "UPI"];
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleInputChange = (field: string, value: string) => {
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

  const handleSelectChange = (event: any, field: string) => {
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

  //Z-T87
  const handleSubmit = async(values) => {
     try {
      const payload = {
        ...values,
        // Convert date to ISO string for backend
        last_purchase_date: new Date(values.last_purchase_date).toISOString(),
      };
      console.log(payload,"my payload")
      const response = await addInventoryItem(payload).unwrap();
      console.log("✅ Inventory updated successfully:", response);

    } catch (error) {
      console.error("❌ Failed to update inventory:", error);
    }

  };

  return (
    <Box>
      {/* 🔍 Search bar & Add button */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        <Autocomplete
          freeSolo
          options={items.map((item) => item.name)}
          inputValue={searchValue}
          onInputChange={(event, newValue) => setSearchValue(newValue)}
          sx={{ width: 300, mr: 2 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search by ID, product, or others..."
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SearchIcon sx={{ color: "action.active", mr: 1 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Box sx={{ display: "flex", flexGrow: 1 }}></Box>
        {/* <Button
          variant="contained"
          disableElevation
          onClick={() => setDrawerOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
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
          Add Inventory
        </Button> */}
      </Box>

      {/* 📦 Inventory Table / Loader / Error */}
      <Box
        sx={{
          backgroundColor: "white",
          padding: 2,
          borderRadius: 2,
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: isInventoryLoading ? "center" : "flex-start",
        }}
      >
        {isInventoryLoading ? (
          <CircularProgress color="primary" />
        ) : isInventoryError ? (
          <Box sx={{ textAlign: "center", width: "100%" }}>
            <p>Failed to load inventory data. Please try again later.</p>
          </Box>
        ) : (
          <InventoryItemsTable
            items={filteredItems}
            onRowClick={handleRowClick}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        )}
      </Box>

      {/* Z-T87 Item View Modal */}
      <ItemViewModal
        open={viewModalOpen}
        initialData={selectedItem}
        onSubmit={handleSubmit}
        onClose={() => setViewModalOpen(false)}
      />

      {/* ➕ Drawer for Adding Inventory */}
      <InventoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        formData={formData}
        categories={categories}
        paymentMethods={paymentMethods}
        uploading={false}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        setAddCategoryOpen={setAddCategoryOpen}
        addCategoryOpen={addCategoryOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleAddCategory={handleAddCategory}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
};

export default DirectInventoryScreen;
