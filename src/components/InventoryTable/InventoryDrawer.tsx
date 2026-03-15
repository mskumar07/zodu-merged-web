//Z-T87 IdirectInventoryDrawer.tsx
import React from "react";
import {
  Drawer,
  Box,
  Grid,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  CircularProgress, //Z-T87
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux"; //Z-T97
import { BranchId } from "@store/slices/userSlice"; //Z-T97
import CloseIcon from "@mui/icons-material/Close";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikTextInput from "@components/FormikTextInput";
import {
  useGetMenuCategoryQuery, // Z-T87 added getMenuItems Query
} from "@services/menuApi";
import AddIcon from "@mui/icons-material/Add"; //Z-T87
// ✅ Validation schema
const validationSchema = Yup.object().shape({
  itemName: Yup.string().required("Item name is required"),
  itemUnit: Yup.string().required("Item unit is required"),
  stockQuantity: Yup.number()
    .typeError("Stock quantity must be a number")
    .required("Stock quantity is required"),
  stockAlert: Yup.number()
    .typeError("Stock alert must be a number")
    .required("Stock alert is required"),
  purchasePrice: Yup.number()
    .typeError("Purchase price must be a number")
    .required("Purchase price is required"),
  createdAt: Yup.date().required("Created date is required"),
});

// ✅ Initial values
const initialValues = {
  itemName: "",
  itemUnit: "",
  stockQuantity: "",
  stockAlert: "",
  purchasePrice: "",
  createdAt: "",
  menu_category: "",
};

const ITEM_UNITS = ["kg", "litre", "pcs", "box"];

interface IndirectInventoryDrawerProps {
  open: boolean;
  onClose: () => void;
  handleSubmit: (values: typeof initialValues) => void;
}

const IndirectInventoryDrawer: React.FC<IndirectInventoryDrawerProps> = ({
  open,
  onClose,
  handleSubmit,
}) => {
  const branchId = useSelector(BranchId); //Z-T97
  console.log("Branch ID inventory Drawer:", branchId); //Z-T97
   const {
     isLoading: isMenuCategoryLoading,
     isError: isMenuCategoryError,
     data: menuCategory,
     // error: menuCategoryError,
  } = useGetMenuCategoryQuery(branchId); // Z-T75 added getMenuItems Query;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, bgcolor: "white", height: "100vh" },
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form>
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
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Grid>
                  <Typography variant="h6" fontWeight="bold">
                    Indirect Inventory Item
                  </Typography>
                </Grid>
                <Grid>
                  <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>

              {/* Scrollable Form Fields */}
              <Box sx={{ flexGrow: 1, overflow: "auto", pr: 1 }}>
                <Grid container spacing={2}>
                  {/* 1️⃣ Item Name */}
                  <Grid size={{ xs: 12 }}>
                    <FormikTextInput
                      name="itemName"
                      placeholder="Item Name"
                      InputType="DrawerForm"
                    />
                  </Grid>

                  {/* 2️⃣ Item Unit (Dropdown) */}
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Item Unit</InputLabel>
                      <Select
                        label="Item Unit"
                        name="itemUnit"
                        value={values.itemUnit}
                        onChange={handleChange}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                      >
                        {ITEM_UNITS.map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 3️⃣ Stock Quantity */}
                  <Grid size={{ xs: 12 }}>
                    <FormikTextInput
                      name="stockQuantity"
                      placeholder="Stock Quantity"
                      type="number"
                      InputType="DrawerForm"
                    />
                  </Grid>

                  {/* 4️⃣ Stock Alert */}
                  <Grid size={{ xs: 12 }}>
                    <FormikTextInput
                      name="stockAlert"
                      placeholder="Stock Alert"
                      type="number"
                      InputType="DrawerForm"
                    />
                  </Grid>

                  {/* 5️⃣ Purchase Price */}
                  <Grid size={{ xs: 12 }}>
                    <FormikTextInput
                      name="purchasePrice"
                      placeholder="Purchase Price"
                      type="number"
                      InputType="DrawerForm"
                    />
                  </Grid>
                  {/* Category */}
                  <Grid size={{ xs: 12, md: 12 }}>
                    {/* Z-T75 updated menu categories*/}
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={values.menu_category}
                        label="Category"
                        onChange={(e) => {
                          setFieldValue("menu_category", e.target.value);
                        }}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                      >
                        {/* Loading State */}
                        {isMenuCategoryLoading && (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />{" "}
                            Loading...
                          </MenuItem>
                        )}

                        {/* Error State */}
                        {isMenuCategoryError && (
                          <MenuItem disabled>
                            ❌ Failed to load categories
                          </MenuItem>
                        )}

                        {/* Categories Loaded */}
                        {menuCategory?.Data?.map((cat: any) => (
                          <MenuItem key={cat.id || cat} value={cat.id || cat}>
                            {cat.name || cat}
                          </MenuItem>
                        ))}

                        {/* Add Category Option
                                            {!isMenuCategoryLoading && !isMenuCategoryError && (
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
                                            )} */}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 6️⃣ Created At */}
                  <Grid size={{ xs: 12 }}>
                    <FormikTextInput
                      name="createdAt"
                      placeholder="Created At"
                      type="date"
                      InputType="DrawerForm"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Submit Button */}
              <Box sx={{ pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#dc2626",
                    "&:hover": { bgcolor: "#b91c1c" },
                  }}
                >
                  Save Item
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Drawer>
  );
};

export default IndirectInventoryDrawer;
