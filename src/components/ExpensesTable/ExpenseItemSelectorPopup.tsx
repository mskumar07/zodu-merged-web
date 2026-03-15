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
  selectedItems?: any[]; 
  onClose: () => void;
  onConfirm: (items: any[]) => void;
}

const ExpenseItemSelectorPopup = ({
  open,
  items,
  selectedItems,
  onClose,
  onConfirm,
}: Props) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, any>>({});
  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );


  useEffect(() => {
  if (open && selectedItems?.length) {
    const mapped: Record<string, any> = {};

    selectedItems.forEach((item) => {
      mapped[item.item_id] = {
        ...item,
      };
    });

    setSelected(mapped);
  }

  // reset when popup closes (optional but recommended)
  if (!open) {
    setSelected({});
  }
}, [open, selectedItems]);


  const updateItem = (code: string, changes: Partial<any>) => {
    setSelected((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        ...changes,
      },
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight={600}>Select Items</Typography>
          <IconButton onClick={onClose}>
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
        {filteredItems.map((item) => {
          const row = selected[item.item_code];

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
              </Typography>

              {/* Qty Section */}
              {!row ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setSelected((prev) => ({
                      ...prev,
                      [item.item_code]: {
                        id: crypto.randomUUID(),
                        item_id: item.item_code,
                        name: item.name,
                        qty: 1,
                        price: 0,
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #dc2626",
                    overflow: "hidden",
                    borderRadius: 1,
                  }}>
                  {/* Minus */}
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
                        updateItem(item.item_code, { qty: row.qty - 1 });
                      }
                    }}
                    sx={{ color: "#dc2626" }}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>

                  {/* Qty TextField */}
                  <TextField
                    variant="standard"
                    value={row.qty}
                    inputProps={{
                      min: 1,
                      style: {
                        textAlign: "center",
                        width: 40,
                        fontWeight: 600,
                      },
                    }}
                    onChange={(e) => {
                      const val = Number(e.target.value);

                      if (!e.target.value) {
                        // Allow empty while typing
                        updateItem(item.item_code, { qty: "" });
                      } else if (val <= 0) {
                        const copy = { ...selected };
                        delete copy[item.item_code];
                        setSelected(copy);
                      } else {
                        updateItem(item.item_code, { qty: val });
                      }
                    }}
                    onBlur={() => {
                      // Fix empty qty on blur
                      if (!row.qty || row.qty <= 0) {
                        updateItem(item.item_code, { qty: 1 });
                      }
                    }}
                  />

                  {/* Plus */}
                  <IconButton
                    size="small"
                    onClick={() =>
                      updateItem(item.item_code, {
                        qty: (Number(row.qty) || 0) + 1,
                      })
                    }
                    sx={{ color: "#dc2626" }}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Price (Always Visible) */}
              <TextField
                type="number"
                size="small"
                placeholder="Price"
                sx={{ width: 90 }}
                value={!row?.price || row.price === 0 ? "" : Number(row.price)}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const numValue =
                    inputValue === "" || inputValue === null
                      ? 0
                      : parseFloat(inputValue);

                  setSelected((prev) => ({
                    ...prev,
                    [item.item_code]: {
                      ...(prev[item.item_code] ?? {
                        id: crypto.randomUUID(),
                        item_id: item.item_code,
                        name: item.name,
                        qty: 1,
                      }),
                      price: isNaN(numValue) ? 0 : numValue,
                    },
                  }));
                }}
                onFocus={(e) => {
                  const currentValue = e.target.value;
                  if (currentValue === "0" || parseFloat(currentValue) === 0) {
                    setTimeout(() => {
                      e.target.value = "";
                    }, 0);
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
          onClick={() => onConfirm(Object.values(selected))}>
          Add Selected
        </Button>
      </Box>
    </Dialog>
  );
};

export default ExpenseItemSelectorPopup;
