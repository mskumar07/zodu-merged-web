import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";

import Button from "../Button";
import CartItem from "./CartItem";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Upload as UploadIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material/Select";
import CreateNewItem from "./CreateNewItem";

interface expenseItemsList {
  id: string;
  count: number;
  price: number;
  productName: string;
  total: number;
}

interface ExpenseFormData {
  expenseId: string;
  date: string;
  expenseName: string;
  expenseItems?: expenseItemsList[];
  category: string;
  totalAmount: string;
  amountPaid: string;
  paymentMethod: string;
  attachments: string;
  description: string;
}

interface AddExpensesDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  expense?: ExpenseFormData | null; 
}

// Example: Categories array of objects for expenses
const ExpenseItems = [
  {
    id: "cat-001",
    name: "Office Supplies",
    description: "Stationery, printer ink, and office consumables",
  },
  {
    id: "cat-002",
    name: "Travel",
    description: "Flights, hotels, taxis, and travel-related costs",
  },
  {
    id: "cat-003",
    name: "Meals & Entertainment",
    description: "Client meetings, staff lunches, business events",
  },
  {
    id: "cat-004",
    name: "Equipment",
    description: "Computers, furniture, and related assets",
  },
  {
    id: "cat-005",
    name: "Utilities",
    description: "Electricity, water, and internet bills",
  },
  {
    id: "cat-006",
    name: "Marketing",
    description: "Advertising, social media, and promotional costs",
  },
  {
    id: "cat-007",
    name: "Training",
    description: "Courses, materials, and staff workshops",
  },
  {
    id: "cat-008",
    name: "Other",
    description: "Miscellaneous expenses not covered above",
  },
];

const AddExpensesDrawer: React.FC<AddExpensesDrawerProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    expenseId: "3275825687",
    date: "18-08-2025",
    expenseName: "",
    category: "",
    totalAmount: "",
    expenseItems: [],
    amountPaid: "",
    paymentMethod: "",
    attachments: "",
    description: "",
  });

  // Predefined categories to choose from in dropdown
  const [categories, setCategories] = useState([
    "Office Supplies",
    "Travel",
    "Meals & Entertainment",
    "Equipment",
    "Utilities",
    "Marketing",
    "Training",
    "Other",
  ]);

  const [selectedExpenseItems, setSelectedExpenseItems] = useState<string[]>(
    []
  );
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [createNewItemOpen, setCreateNewItemOpen] = useState(false);

  const onCreateNewItemOpen = () => setCreateNewItemOpen(true);
  const onCreateNewItemClose = () => setCreateNewItemOpen(false);

  // Fixed payment methods for dropdown
  const paymentMethods = [
    "Credit Card",
    "Debit Card",
    "Cash",
    "Bank Transfer",
    "PayPal",
    "Check",
  ];

  const handleExpenseItemsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Toggle expense item selection (checked/unchecked)
    const { value } = event.target;
    setSelectedExpenseItems((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    // Update specific form field dynamically
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (
    event: SelectChangeEvent<string>,
    field: keyof ExpenseFormData
  ) => {
    // Handles controlled Select dropdowns (category, payment method, etc.)
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAddCategory = () => {
    // Add a new custom category entered by the user
    if (newCategoryName.trim()) {
      setCategories((prev) => [...prev, newCategoryName.trim()]);
      setFormData((prev) => ({ ...prev, category: newCategoryName.trim() }));
      setNewCategoryName("");
      setAddCategoryOpen(false);
    }
  };

  const handleAddItems = () => {
    // Open "Add Items" modal dialog
    setAddItemsOpen(true);
  };

  const handleSubmit = () => {
    // Pass form data to parent or API handler
    onSubmit(formData);

    // Reset form with a new expense ID and current date
    setFormData({
      expenseId: Math.random().toString().substring(2, 12),
      date: new Date().toLocaleDateString("en-GB"),
      expenseName: "",
      category: "",
      totalAmount: "",
      amountPaid: "",
      paymentMethod: "",
      attachments: "",
      description: "",
    });

    // Close modal after submit
    onClose();
  };

  // Map selected expense items into the expenseItems list
  const handleAddExpenseItems = () => {
    // Keep only items that were selected by user
    const filteredItems = ExpenseItems.filter((item) =>
      selectedExpenseItems.includes(item.id)
    );

    // Normalize to expenseItemsList format with defaults
    const mappedItems: expenseItemsList[] = filteredItems.map((item) => ({
      id: item.id,
      count: 1, // default count
      price: 0, // default price
      productName: item.name,
      total: 0, // will be updated when count/price changes
    }));

    // Merge new items with existing ones while avoiding duplicates
    setFormData((prev) => {
      const existingItems = prev.expenseItems || [];
      const newItems = mappedItems.filter(
        (item) => !existingItems.some((e) => e.id === item.id)
      );

      return {
        ...prev,
        expenseItems: [...existingItems, ...newItems],
      };
    });

    setAddItemsOpen(false); // close modal
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          bgcolor: "white",
          height: "100vh",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Add Expenses
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flexGrow: 1, overflow: "auto", pr: 1 }}>
          {/* Expense ID and User Info */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="body2" color="error">
                Expense Id : {formData.expenseId}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#67e8f9",
                    fontSize: "14px",
                  }}
                >
                  DS
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Darrell Steward
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Warehouse
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Date Field */}
            <TextField
              fullWidth
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              InputProps={{
                endAdornment: <CalendarIcon sx={{ color: "action.active" }} />,
              }}
              size="small"
            />

            {/* Expense Name */}
            <TextField
              fullWidth
              placeholder="Expense Name"
              value={formData.expenseName}
              onChange={(e) => handleInputChange("expenseName", e.target.value)}
              size="small"
            />

            {/* Category */}
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleSelectChange(e, "category")}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 200 },
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={() => setAddCategoryOpen(true)}
                  sx={{
                    color: "primary.main",
                    "&:hover": { bgcolor: "primary.50" },
                  }}
                >
                  <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                  Add Category
                </MenuItem>
              </Select>
            </FormControl>

            {/* Amount Fields */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                placeholder="Total Amount"
                value={formData.totalAmount}
                onChange={(e) =>
                  handleInputChange("totalAmount", e.target.value)
                }
                type="number"
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                placeholder="Amount Paid"
                value={formData.amountPaid}
                onChange={(e) =>
                  handleInputChange("amountPaid", e.target.value)
                }
                type="number"
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Payment Method */}
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Payment Method"
                onChange={(e) => handleSelectChange(e, "paymentMethod")}
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Attachments */}
            <Box sx={{ position: "relative" }}>
              <input
                type="file"
                id="upload-file"
                hidden
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploading(true);
                    const file = e.target.files[0];

                    // Fake upload simulation (replace with API upload)
                    await new Promise((res) => setTimeout(res, 2000));

                    setFormData((prev) => ({
                      ...prev,
                      attachments: file.name,
                    }));
                    setUploading(false);
                  }
                }}
              />
              <TextField
                fullWidth
                placeholder="Attachments"
                value={uploading ? "Uploading..." : formData.attachments}
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton component="label" htmlFor="upload-file">
                      <UploadIcon
                        sx={{ color: uploading ? "grey.400" : "action.active" }}
                      />
                    </IconButton>
                  ),
                }}
              />
            </Box>

            {/* Description */}
            <TextField
              fullWidth
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              multiline
              rows={4}
              size="small"
              sx={{ mb: 2 }}
            />
            {formData.expenseItems && formData.expenseItems.length > 0 && (
              <>
                {formData.expenseItems.map((item, index) => (
                  <CartItem
                    key={item.id} // always give a key when mapping
                    name={item.productName}
                    id={item.id}
                    price={item.price}
                    quantity={item.count}
                    onRemove={(id) => {
                      const updatedItems = formData.expenseItems?.filter(
                        (expItem) => expItem.id !== id
                      );
                      setFormData((prev) => ({
                        ...prev,
                        expenseItems: updatedItems,
                      }));
                      // You could also filter out from state here
                    }}
                    onPriceChange={(newPrice) => {
                      // Update the price in your state here if needed
                      const updatedItems = formData.expenseItems?.map(
                        (expItem) =>
                          expItem.id === item.id
                            ? {
                                ...expItem,
                                price: newPrice,
                                total: newPrice * expItem.count,
                              }
                            : expItem
                      );
                      setFormData((prev) => ({
                        ...prev,
                        expenseItems: updatedItems,
                      }));
                    }}
                    onQuantityChange={(qty) => {
                      // Update the count in your state here if needed
                      const updatedItems = formData.expenseItems?.map(
                        (expItem) =>
                          expItem.id === item.id
                            ? {
                                ...expItem,
                                count: qty,
                                total: qty * expItem.price,
                              }
                            : expItem
                      );
                      setFormData((prev) => ({
                        ...prev,
                        expenseItems: updatedItems,
                      }));
                    }}
                  />
                ))}
                <Typography
                  color="info"
                  variant="subtitle1"
                  sx={{ cursor: "pointer" }}
                  onClick={onCreateNewItemOpen}
                >
                  + Create new item
                </Typography>
              </>
            )}

            {/* Add expense item */}
            <Button variant="outlined" onClick={() => setAddItemsOpen(true)}>
              Add Items
            </Button>
          </Box>
        </Box>

        {/* Submit Button - Fixed at bottom */}
        <Box sx={{ pt: 2, borderTop: "1px solid #f0f0f0" }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              bgcolor: "#dc2626",
              "&:hover": {
                bgcolor: "#b91c1c",
              },
            }}
          >
            Add Expense
          </Button>
        </Box>
      </Box>

      {/* Add Item Modal */}
      <Drawer
        anchor="bottom"
        open={addItemsOpen}
        onClose={() => setAddItemsOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            bgcolor: "white",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            p: 0,
            ml: "auto",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Add Items
            </Typography>
            <IconButton
              onClick={() => setAddItemsOpen(false)}
              size="small"
              sx={{ color: "grey.500" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Previosuly added categories */}
          <FormGroup>
            <>
              {ExpenseItems?.map((category) => (
                <FormControlLabel
                  key={category.id}
                  control={
                    <Checkbox
                      value={category.id}
                      onChange={handleExpenseItemsChange}
                      checked={selectedExpenseItems.includes(category.id)}
                    />
                  }
                  label={category.name}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "row-reverse",
                    flex: 1,
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                />
              ))}

              {/* Add Category Button */}
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#dc2626",
                  "&:hover": { bgcolor: "#b91c1c" },
                  "&:disabled": { bgcolor: "#f5f5f5", color: "#999" },
                }}
                onClick={handleAddExpenseItems}
              >
                Done
              </Button>
            </>
          </FormGroup>
        </Box>
      </Drawer>

      {/* Add Category Drawer */}
      <Drawer
        anchor="bottom"
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            bgcolor: "white",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            p: 0,
            ml: "auto",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Add Category
            </Typography>
            <IconButton
              onClick={() => setAddCategoryOpen(false)}
              size="small"
              sx={{ color: "grey.500" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Category Name Input */}
          <TextField
            fullWidth
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            size="small"
            sx={{ mb: 3 }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddCategory();
              }
            }}
          />

          {/* Add Category Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim()}
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              "&:disabled": { bgcolor: "#f5f5f5", color: "#999" },
            }}
          >
            Add Category
          </Button>
        </Box>
      </Drawer>

      <>
        {/* Modal with Form */}
        <CreateNewItem
          open={createNewItemOpen}
          onClose={onCreateNewItemClose}
        />
      </>
    </Drawer>
  );
};

export default AddExpensesDrawer;
