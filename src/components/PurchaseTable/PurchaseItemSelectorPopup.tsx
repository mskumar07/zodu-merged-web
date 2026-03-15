import {
  Box,
  Dialog,
  IconButton,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  items: any[];
  existingItems?: any[];
  onClose: () => void;
  onConfirm: (items: any[]) => void;
}

const PurchaseItemSelectorPopup = ({
  open,
  items,
  existingItems = [],
  onClose,
  onConfirm,
}: Props) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, any>>({});
  console.log(open,items,existingItems,existingItems.length, "purchase item selector props");
  useEffect(() => {
    if (open) {
      const initialSelected: Record<string, any> = {};

      // Handle both Add drawer (existingItems from form values)
      // and Edit drawer (existingItems from editData)
      existingItems.forEach((item) => {
        const itemCode = item.item_id || item.id;
        if (itemCode) {
          initialSelected[itemCode] = {
            ...item,
            item_code: item.item_id || item.id,
            name: item.name,
            qty: item.qty || 1,
            price: item.price || item.purchase_price || 0,
            unit_id: item.unit,
            unit_name: item.unit_name,
            purchase_price: item.price || item.purchase_price || 0,
            selling_price: item.selling_price || 0,
            gst_tax: item.gst_tax || 0,
          };
        }
      });

      setSelected(initialSelected);
    }
  }, [open, existingItems]);

  const filteredItems = items?.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = () => {
    setSearch("");
    setSelected({});
    onClose();
  };

  const handleConfirm = () => {
    const selectedItems = Object.values(selected).map((item) => ({
      item_code: item.item_code || item.item_id || item.id,
      name: item.name,
      qty: item.qty || 1,
      price: item.price || 0,
      unit_id: item.unit_id,
      unit_name: item.unit_name,
      purchase_price: item.price || 0,
      selling_price: item.selling_price || 0,
      gst_tax: item.gst_tax || 0,
    }));
    onConfirm(selectedItems);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight={600}>Select Items</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search items..."
          sx={{ mt: 2 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Items */}
      <Box sx={{ maxHeight: 420, overflowY: "auto", p: 2 }}>
        {filteredItems?.map((item) => {
          const row = selected[item.item_code];
          const isSelected = !!row;

          return (
            <Box
              key={item.item_code}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                p: 1.5,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}>
              {/* Name */}
              <Typography sx={{ flex: 1, fontWeight: 500 }}>
                {item.name}
                {item.unit_name && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ ml: 1, color: "text.secondary" }}>
                    ({item.unit_name})
                  </Typography>
                )}
              </Typography>

              {/* Quantity Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {!isSelected ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setSelected((prev) => ({
                        ...prev,
                        [item.item_code]: {
                          ...item,
                          item_code: item.item_code,
                          qty: 1,
                          price: item.purchase_price || 0,
                        },
                      }))
                    }
                    sx={{
                      borderColor: "#dc2626",
                      color: "#dc2626",
                      width: 100,
                      px: 2,
                    }}>
                    Add
                  </Button>
                ) : (
                  <>
                    {/* Minus Button */}
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (row.qty <= 1) {
                          setSelected((prev) => {
                            const copy = { ...prev };
                            delete copy[item.item_code];
                            return copy;
                          });
                        } else {
                          setSelected((prev) => ({
                            ...prev,
                            [item.item_code]: {
                              ...prev[item.item_code],
                              qty: prev[item.item_code].qty - 1,
                            },
                          }));
                        }
                      }}
                      sx={{ color: "#dc2626" }}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>

                    {/* Typeable Quantity Input */}
                    <TextField
                      size="small"
                      type="number"
                      value={row.qty || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0) {
                          setSelected((prev) => ({
                            ...prev,
                            [item.item_code]: {
                              ...prev[item.item_code],
                              qty: val,
                            },
                          }));
                        } else if (e.target.value === "") {
                          setSelected((prev) => ({
                            ...prev,
                            [item.item_code]: {
                              ...prev[item.item_code],
                              qty: "",
                            },
                          }));
                        }
                      }}
                      onBlur={(e) => {
                        if (!row.qty || row.qty <= 0) {
                          setSelected((prev) => {
                            const copy = { ...prev };
                            delete copy[item.item_code];
                            return copy;
                          });
                        }
                      }}
                      inputProps={{
                        min: 1,
                        style: {
                          textAlign: "center",
                          width: 60,
                          fontWeight: 600,
                        },
                      }}
                      sx={{ width: 70 }}
                    />

                    {/* Plus Button */}
                    <IconButton
                      size="small"
                      onClick={() =>
                        setSelected((prev) => ({
                          ...prev,
                          [item.item_code]: {
                            ...prev[item.item_code],
                            qty: (prev[item.item_code].qty || 1) + 1,
                          },
                        }))
                      }
                      sx={{ color: "#dc2626" }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>

              {/* Typeable Price Input - Always visible */}
              <TextField
                type="number"
                size="small"
                placeholder="Price"
                sx={{ width: 100 }}
                value={isSelected ? row.price || "" : ""}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const numValue = parseFloat(inputValue);

                  if (isSelected) {
                    setSelected((prev) => ({
                      ...prev,
                      [item.item_code]: {
                        ...prev[item.item_code],
                        price: isNaN(numValue) ? 0 : numValue,
                      },
                    }));
                  } else {
                    // If not selected, add item with this price
                    setSelected((prev) => ({
                      ...prev,
                      [item.item_code]: {
                        ...item,
                        item_code: item.item_code,
                        qty: 1,
                        price: isNaN(numValue) ? 0 : numValue,
                      },
                    }));
                  }
                }}
                onFocus={(e) => {
                  if (!isSelected) {
                    // Auto-add item when focusing on price if not already selected
                    setSelected((prev) => ({
                      ...prev,
                      [item.item_code]: {
                        ...item,
                        item_code: item.item_code,
                        qty: 1,
                        price: item.purchase_price || 0,
                      },
                    }));
                    setTimeout(() => e.target.select(), 0);
                  }
                }}
                inputProps={{
                  min: 0,
                  step: "any",
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid #eee" }}>
        <Button
          fullWidth
          variant="contained"
          sx={{ bgcolor: "#dc2626", py: 1.2 }}
          onClick={handleConfirm}>
          {Object.keys(selected).length > 0 ? "Update Items" : "Add Selected"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default PurchaseItemSelectorPopup;
