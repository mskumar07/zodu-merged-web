import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { BranchId } from "@store/slices/userSlice";
import {
  Drawer,
  Box,
  Grid,
  Typography,
  IconButton,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  RadioGroup,
  FormControlLabel,
  CircularProgress, //Z-T75
  Radio,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import qrCode from "../../assets/icons/TableIcons/qr-code.png";
import FormikTextInput from "@components/FormikTextInput";
import { Formik, FieldArray, Form } from "formik"; // Z-T71
import * as Yup from "yup"; // Z-T71
import DeleteIcon from "@mui/icons-material/Delete"; // Z-T71
import TaxRateSelect from "@components/TaxRateSelect"; // Z-T71
import { SkuField } from "./SkuField"; // Z-T71
import {
  useAddMenuItemMutation,
  useGetGstListQuery,
  useGetMenuCategoryQuery,
  useGetUnitsListQuery,
  useUpdateMenuItemMutation, // Z-T75 added getMenuItems Query
  useUploadImageMutation,
} from "@services/menuApi"; // Z-T71
import { objectToFormData } from "@utils/util"; //Z-T75 updated routing
import MenuUnitSelect from "@components/MenuUnitSelect";
import type { FormikHelpers } from "formik"; // Import FormikHelpers for typing
import type { MenuItemFormValues } from "@pages/MenuItemScreen"; // Z-T71 import form values type
import { messageConstant } from "@config/messageConstants";
import { toast } from "react-toastify";

const RADIO_LABEL_VARIANT = "body2";

// Z-T71 add inital validation schema
const validationSchema = Yup.object().shape({
  menu_name: Yup.string().required("Menu Name is required"),
  sell_price: Yup.number()
    .typeError("Sell Price must be a number")
    .required("Sell Price is required")
    .min(0, "Sell Price cannot be negative"),
  totalPrice: Yup.number(),
  gst_tax: Yup.number()
    .typeError("GST Tax must be a number")
    .required("GST Tax is required")
    .min(0, "GST Tax cannot be negative"),
  menu_category:  Yup.string().required("Menu Category is required"),
  menu_unit: Yup.string().required("Menu Unit is required"),
  item_code: Yup.string().required("Item Code is required"),
  hsn_code: Yup.string(),
  tax_include_or_exclude: Yup.boolean().required(),

  // Conditional validation for Product
  purchase_price: Yup.number().when("menu_type", {
    is: "Product",
    then: (schema) =>
      schema
        .typeError("Purchase Price must be a number")
        .required("Purchase Price is required for Product")
        .min(0, "Purchase Price cannot be negative"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Conditional validation for Food
  food_type: Yup.string().when("menu_type", {
    is: "Food",
    then: (schema) => schema.required("Food Type is required for Food"),
    otherwise: (schema) => schema.notRequired(),
  }),
  variants: Yup.array().when("menu_type", {
    is: "Food",
    then: (schema) =>
      schema.of(
        Yup.object().shape({
          id: Yup.string().required("Variant ID is required"),
          variant_name: Yup.string().required("Variant Name is required"),
          price: Yup.number()
            .typeError("Variant Price must be a number")
            .required("Variant Price is required")
            .min(0, "Variant Price cannot be negative"),
        })
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
});

interface AddMenuDrawerProps {
  open: boolean;
  initialValues: MenuItemFormValues;
  onClose: () => void;
  setAddCategoryOpen: (open: boolean) => void;
  addCategoryOpen: boolean;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  handleAddCategory: () => void;
}

const AddMenuDrawer: React.FC<AddMenuDrawerProps> = ({
  open,
  initialValues,
  onClose,
  setAddCategoryOpen,
  addCategoryOpen,
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [addMenu, { isLoading }] = useAddMenuItemMutation();
  const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuItemMutation(); // Z-T97 new mutation for updating menu item
  const [showBarcode, setShowBarcode] = React.useState(false);
  const [menuType, setMenuType] = React.useState<"Product" | "Food">("Product");
  const branchId = useSelector(BranchId);



  useEffect(() => {
    if (initialValues.menu_type) {
      setMenuType(initialValues.menu_type);
    }
  }, [initialValues.menu_type]);

  const {
    isLoading: isMenuCategoryLoading,
    isError: isMenuCategoryError,
    data: menuCategory,
    // error: menuCategoryError,
  } = useGetMenuCategoryQuery(
    { branchId: branchId, type: menuType },
    { refetchOnMountOrArgChange: true }
  ); // Z-T75 added getMenuItems Query;

  //handleImage
  const [
    uploadImage,
    { isLoading: isUploading, isError: isUploadError, error: uploadError },
  ] = useUploadImageMutation();
  const {
    isLoading: isGstListLoading,
    isError: isGstListError,
    data: gstList,
    // error: gstListError,
  } = useGetGstListQuery(branchId); //Z-T97 fetch GST list

  const {
    isLoading: isUnitsListLoading,
    isError: isUnitsListError,
    data: unitsList,
    // error: unitsListError,
  } = useGetUnitsListQuery(branchId); //Z-T97 fetch Units list



  const handleUploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await uploadImage(formData).unwrap();
      return data.fileUrl; // Assuming the API returns the URL in 'imageUrl'
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error(messageConstant.failure.IMAGE_UPLOAD_FAILED);
      return;
    }
  };

  const handleCreate = async (values: MenuItemFormValues, resetForm: any) => {
    //Z-T97 exclude menu_id from form data
    const { menu_id, ...rest } = values;
    const formData = objectToFormData(rest); // ✅ dynamically converts all fields

    if (values.menu_image && values.menu_image instanceof File) {
      const imageUrl = await handleUploadImage(values.menu_image);
      formData.append("menu_image", imageUrl);
    }

    formData.append("zodu_id", "ZODU035");
    formData.append("branch_id", branchId);
    formData.append("menu_category_id", values.menu_category);
    formData.delete("menu_category");
    formData.delete("totalPrice");
    try {
      await addMenu(formData).unwrap();
      console.log("Menu added successfully!");
      toast.success(messageConstant.success.MENU_ADDED);
      setShowBarcode(false);
      resetForm();
    } catch (err) {
      console.error("Error adding menu:", err);
    }
  };

  const handleUpdate = async (values: MenuItemFormValues, resetForm: any) => {
    try {
      // Assuming updateMenu is a defined mutation similar to addMenu
      values.menu_category_id = values.menu_category;
      if (values.menu_image && values.menu_image instanceof File) {
        const imageUrl = await handleUploadImage(values.menu_image);
        values.menu_image = imageUrl;
      }
      await updateMenu({ menuId: values.menu_id, payload: values }).unwrap();
      console.log("Menu updated successfully!");
      toast.success(messageConstant.success.MENU_UPDATED);
      setShowBarcode(false);
      onClose();
      resetForm();
    } catch (err) {
      console.error("Error updating menu:", err);
      toast.error(messageConstant.error.MENU_UPDATE_FAILED);
    }
  };

  const handleFormSubmit = async (
    values: MenuItemFormValues,
    { resetForm }: FormikHelpers<MenuItemFormValues>
  ) => {
    if (values.menu_id) {
      // 👉 Call update function
      await handleUpdate(values, resetForm);
    } else {
      // 👉 Call create function
      await handleCreate(values, resetForm);
    }
  };
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
        validationSchema={validationSchema} // Enabled validation schema
        enableReinitialize={true}
        onSubmit={handleFormSubmit}
      >
        {({ values, setFieldValue, resetForm, errors }) => {

          useEffect(() => {
            const sell_price = parseFloat(values.sell_price) || 0;
            const gst_tax = parseFloat(values.gst_tax) || 0;

            let total = sell_price;

            if (!values.tax_include_or_exclude && gst_tax > 0) {
              total = sell_price + (sell_price * gst_tax) / 100;
            }

            setFieldValue("totalPrice", total.toFixed(2)); // keep as string
          }, [
            values.sell_price,
            values.gst_tax,
            values.tax_include_or_exclude,
            setFieldValue,
          ]);

          // Effect to reset fields when menu_type changes
          useEffect(() => {
            if (values.menu_type === "Product") {
              // Reset Food-specific fields
              setFieldValue("food_type", initialValues.food_type);
              setFieldValue("variants", initialValues.variants);
            } else if (values.menu_type === "Food") {
              // Reset Product-specific fields
              setFieldValue("purchase_price", initialValues.purchase_price);
            }
          }, [values.menu_type, setFieldValue, initialValues]); // Added initialValues to dependency array for correctness

          // Effect to update variant IDs when names change
          useEffect(() => {
            if (values.menu_type === "Food" && values.variants) {
              values.variants.forEach((variant, index) => {
                // Sanitize name (replace spaces, convert to lowercase)
                const sanitizedName = variant.variant_name
                  ? variant.variant_name.replace(/\s+/g, "-").toLowerCase()
                  : "";

                // Expected ID format: name-XXX (padded index)
                const expectedId = `${sanitizedName}-${String(
                  index + 1
                ).padStart(3, "0")}`;

                // Only update if name exists and ID is different from expected
                if (variant.variant_name && variant.id !== expectedId) {
                  setFieldValue(`variants[${index}].id`, expectedId);
                }
              });
            }
          }, [values.variants, values.menu_type, setFieldValue]);
          return (
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
                      Add Menu Item
                    </Typography>
                  </Grid>
                  <Grid>
                    <IconButton onClick={onClose} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                {/* Info Row (SKU and Barcode) */}
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                  spacing={4}
                >
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="body2" color="error">
                      SKU / Item Code
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    {/* Barcode placeholder (add barcode image or component here) */}
                    <img src={qrCode} style={{ height: 40 }} />
                  </Grid>
                </Grid>

                {/* Scrollable Content */}
                <Box sx={{ flexGrow: 1, overflow: "auto", pr: 1 }}>
                  <Grid container spacing={2}>
                    {/* Image and Type Selection */}
                    <Grid size={{ xs: 12, md: 12 }}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid>
                          {/* Menu Image */}
                          <Box>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              ref={fileInputRef}
                              onChange={(event) => {
                                const file = event.currentTarget.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setFieldValue("menu_image", file); // base64
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />

                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                bgcolor: "#f5f5f5",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                overflow: "hidden",
                              }}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {values.menu_image ? (
                                <img
                                  src={
                                    values.menu_image instanceof File
                                      ? URL.createObjectURL(values.menu_image)
                                      : values.menu_image // string URL from API
                                  }
                                  // src={URL.createObjectURL(values.menu_image)}
                                  alt="menu-item"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  +
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                        <Grid>
                          {/* Product/Food Radio */}
                          <RadioGroup
                            row
                            value={values.menu_type}
                            onChange={(e) => {
                              setFieldValue("menu_type", e.target.value);
                              setMenuType(e.target.value);
                            }}
                          >
                            <FormControlLabel
                              value="Product"
                              control={<Radio />}
                              label={
                                <Typography variant={RADIO_LABEL_VARIANT}>
                                  Product
                                </Typography>
                              }
                            />
                            <FormControlLabel
                              value="Food"
                              control={<Radio />}
                              label={
                                <Typography variant={RADIO_LABEL_VARIANT}>
                                  Food
                                </Typography>
                              }
                            />
                          </RadioGroup>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Category */}
                    <Grid size={{ xs: 12, md: 12 }}>
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
                          {isMenuCategoryLoading && (
                            <MenuItem disabled>
                              <CircularProgress size={20} sx={{ mr: 1 }} />{" "}
                              Loading...
                            </MenuItem>
                          )}
                          {isMenuCategoryError && (
                            <MenuItem disabled>
                              ❌ Failed to load categories
                            </MenuItem>
                          )}
                          {menuCategory?.Data?.map((cat: any) => (
                            <MenuItem key={cat.id || cat} value={cat.id || cat}>
                              {cat.name || cat}
                            </MenuItem>
                          ))}
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
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Menu Name */}
                    <Grid size={{ xs: 12, md: 12 }}>
                      <FormikTextInput
                        name="menu_name"
                        label="Menu Name"
                        placeholder="Menu Name"
                        InputType="DrawerForm"
                      />
                    </Grid>

                    {/* Food Type (Veg/Non-Veg) - Conditional */}
                    {values.menu_type === "Food" && (
                      <Grid size={{ xs: 12, md: 12 }}>
                        <RadioGroup
                          row
                          value={values.food_type}
                          onChange={(e) =>
                            setFieldValue("food_type", e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="Veg"
                            control={<Radio />}
                            label={
                              <Typography variant={RADIO_LABEL_VARIANT}>
                                Veg
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            value="NonVeg"
                            control={<Radio />}
                            label={
                              <Typography variant={RADIO_LABEL_VARIANT}>
                                NonVeg
                              </Typography>
                            }
                          />
                        </RadioGroup>
                      </Grid>
                    )}

                    {/*Z-T77 Add Menu Unit*/}
                    <Grid size={{ xs: 12, md: 12 }}>
                      <MenuUnitSelect
                        name={"menu_unit"}
                        label="Menu Unit"
                        isLoading={isUnitsListLoading}
                        isError={isUnitsListError}
                        menuUnitOptions={unitsList?.Data}
                      />
                    </Grid>

                    {/* Sell Price & Total Price */}
                    <Grid size={{ xs: 12, md: 12 }}>
                      <FormikTextInput
                        name="sell_price"
                        placeholder="Sell Price"
                        label="Sell Price"
                        InputType="DrawerForm"
                        type="number"
                      />
                    </Grid>

                    {/* Purchase Price - Conditional */}

                    <Grid size={{ xs: 12, md: 12 }}>
                      <FormikTextInput
                        name="purchase_price"
                        placeholder="Purchase Price"
                        label="Purchase Price"
                        InputType="DrawerForm"
                        type="number"
                      />
                    </Grid>

                    {/* Variants - Conditional */}
                    {values.menu_type === "Food" && (
                      <Grid size={{ xs: 12, md: 12 }}>
                        <FieldArray name="variants">
                          {({ push, remove }) => (
                            <Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ mb: 1 }}
                              >
                                Variants
                              </Typography>
                              <Grid container spacing={2}>
                                {values.variants &&
                                  values.variants.map((variant, index) => (
                                    <React.Fragment key={index}>
                                      <Grid size={{ xs: 12, md: 12 }}>
                                        <FormikTextInput
                                          name={`variants[${index}].variant_name`}
                                          placeholder="Variant Name"
                                          label="Variant Name"
                                          InputType="DrawerForm"
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 12, md: 12 }}>
                                        <FormikTextInput
                                          name={`variants[${index}].price`}
                                          placeholder="Variant Price"
                                          label="Variant Price"
                                          InputType="DrawerForm"
                                          type="number"
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 12, md: 12 }}>
                                        <IconButton
                                          color="error"
                                          onClick={() => remove(index)}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Grid>
                                    </React.Fragment>
                                  ))}
                              </Grid>

                              <Button
                                startIcon={<AddIcon />}
                                sx={{ mt: 2 }}
                                variant="outlined"
                                onClick={() => {
                                  const newIndex = values.variants
                                    ? values.variants.length
                                    : 0;
                                  push({
                                    id: `variant-${String(newIndex).padStart(
                                      3,
                                      "0"
                                    )}`,
                                    variant_name: "",
                                    price: "",
                                  });
                                }}
                              >
                                Add Variant
                              </Button>
                            </Box>
                          )}
                        </FieldArray>
                      </Grid>
                    )}

                    {/* Tax options */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <RadioGroup
                        row
                        value={values.tax_include_or_exclude}
                        onChange={(e) =>
                          setFieldValue(
                            "tax_include_or_exclude",
                            e.target.value === "true"
                          )
                        }
                        sx={{ display: "flex" }}
                      >
                        <FormControlLabel
                          value={true}
                          control={<Radio />}
                          label={
                            <Typography variant={RADIO_LABEL_VARIANT}>
                              Include Tax
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          value={false}
                          control={<Radio />}
                          label={
                            <Typography variant={RADIO_LABEL_VARIANT}>
                              Exclude Tax
                            </Typography>
                          }
                        />
                      </RadioGroup>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TaxRateSelect
                        name="gst_tax"
                        label="Tax Rate"
                        GSTOptions={gstList?.data || []}
                        isLoading={isGstListLoading}
                        isError={isGstListError}
                      />
                    </Grid>

                    {/* HSN Code - New Field */}
                    <Grid size={{ xs: 12, md: 12 }}>
                      <FormikTextInput
                        name="hsn_code"
                        placeholder="HSN Code"
                        label="HSN Code"
                        InputType="DrawerForm"
                      />
                    </Grid>
                    {/* Item Code */}
                    <Grid size={{ xs: 12, md: 12 }}>
                      <SkuField
                        name="item_code"
                        showBarcode={showBarcode}
                        setShowBarcode={setShowBarcode}
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
                    disabled={isLoading || isUpdating}
                  >
                    {`${initialValues.menu_id ? "Update" : "Add"} Menu`}
                  </Button>
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>

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
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Grid>
              <Typography variant="h6" fontWeight="bold">
                Add Category
              </Typography>
            </Grid>
            <Grid>
              <IconButton
                onClick={() => setAddCategoryOpen(false)}
                size="small"
                sx={{ color: "grey.500" }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                placeholder="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                size="small"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
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
            </Grid>
          </Grid>
        </Box>
      </Drawer>
    </Drawer>
  );
};

export default AddMenuDrawer;
