import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  MenuItem,
  FormControl,
  Select,
  Snackbar,
  Dialog,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@components/Button";

interface Item {
  item_id: string;
  item_name: string;
  item_unit: string;
  purchase_price: string;
  category_name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  inventoryItems: Item[];
  onAddItems: (items: any[]) => void;
}

const AddItemsDrawer: React.FC<Props> = ({
  open,
  onClose,
  inventoryItems,
  onAddItems,
}) => {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [snackbar, setSnackbar] = useState("");

  const handleSelect = (item: Item) => {
    const exists = selectedItems.some((i) => i.item_id === item.item_id);

    if (exists) {
      // remove
      setSelectedItems(selectedItems.filter((i) => i.item_id !== item.item_id));
      return;
    }

    // block different category
    if (selectedItems.length > 0) {
      if (selectedItems[0].category_name !== item.category_name) {
        setSnackbar("You can select items only from the same category.");
        return;
      }
    }

    setSelectedItems([...selectedItems, item]);
  };

  const handleAdd = () => {
    onAddItems(
      selectedItems.map((i) => ({
        id: i.item_id,
        productName: i.item_name,
        count: 1,
        price: Number(i.purchase_price),
        total: Number(i.purchase_price),
      }))
    );

    setSelectedItems([]);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ p: 3 }}>
          {/* HEADER */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}>
            <Typography variant="h6" fontWeight={700}>
              Add Items
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* SELECT DROPDOWN (Category Drawer Style) */}
          <FormControl fullWidth size="small">
            <Select
              multiple
              value={selectedItems.map((i) => i.item_id)} // 🔥 FIXED
              displayEmpty
              renderValue={() =>
                selectedItems.length === 0
                  ? "Select Items"
                  : selectedItems.map((i) => i.item_name).join(", ")
              }
              sx={{
                borderRadius: 2,
                bgcolor: "#f5f5f5",
              }}>
              {inventoryItems.map((item) => (
                <MenuItem
                  key={item.item_id}
                  value={item.item_id}
                  onClick={() => handleSelect(item)}
                  selected={selectedItems.some(
                    (i) => i.item_id === item.item_id
                  )}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}>
                  {item.item_name}
                  <Typography sx={{ opacity: 0.7, fontSize: 12 }}>
                    ₹{item.purchase_price}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ADD BUTTON */}
          <Button
            fullWidth
            variant="contained"
            disabled={selectedItems.length === 0}
            sx={{
              mt: 3,
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              "&:disabled": { bgcolor: "#eee", color: "#888" },
            }}
            onClick={handleAdd}>
            Add Selected Items
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar("")}
        message={snackbar}
      />
    </>
  );
};

export default AddItemsDrawer;
