import React, { useEffect, useState } from "react";
import FormikTextInput from "@components/FormikTextInput";
import {
  Box,
  Typography,
  TextField,
  Select,
  Paper,
  FormHelperText,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  Grid,
  Stack,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import QrCodeIcon from "@mui/icons-material/QrCode";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import Button from "@components/Button";
import CreateNewItem from "@components/ExpensesTable/CreateNewItem";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import {
  useAddPurchaseMutation,
  useEditPurchaseMutation,
  useAddVendorMutation,
  useGetInventoryItemsQuery,
  useGetMenuCategoryQuery,
  useGetVendorsQuery,
  useGetUnitsListQuery,
} from "@store/services/menuApi";
import MultiFileUpload from "@components/Common/Logo/MultiFileUpload";
import { BranchId, ZoduId } from "@store/slices/userSlice";
import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";
import PurchaseItemSelectorPopup from "./PurchaseItemSelectorPopup";

interface AttachmentFile {
  id: string;
  fileName: string; // Changed to lowercase filename
  url: string;
}
interface CategoryData {
  id: string;
  name: string;
}

interface UnitData {
  id: number;
  name: string;
  short_name?: string;
}

interface PurchaseItem {
  id: string;
  item_id?: string;
  name?: string;
  qty: number;
  price: number;
  total: number;
  unit: number; // Changed to number for unit ID
  unit_name?: string; // Optional display name
  purchase_price: number;
  selling_price: number;
  gst_tax: number;
  total_price: number;
}

interface PurchaseItem {
  id: string;
  productName: string;
  count: number;
  price: number;
  total: number;
  unit_id?: string; // Changed from number to string for unit ID
  unit_name?: string; // Optional display name
  purchase_price: number;
  selling_price: number;
  gst_tax: number;
  total_price: number;
  category_id?: string;
}

interface PurchasePayload {
  zodu_id: string;
  purchase_id?: string;
  branch_id: string;
  vendor: string;
  purchase_date: string;
  purchase_type: "Product" | "Other"; // Changed to match your payload
  total_amount: number;
  paid_amount: number;
  attachment_url: AttachmentFile[];
  payment_type: string;
  notes: string;
  items: {
    id: string;
    name: string;
    qty: number;
    unit: string;
    purchase_price: number;
    selling_price: number;
    gst_tax: number;
  }[];
}

interface PurchaseFormData {
  date: dayjs.Dayjs;
  vendorName: string;
  vendorId: string;
  category: string;
  purchaseItems: PurchaseItem[];
  totalAmount: string;
  amountPaid: string;
  paymentMethod: string;
  attachments: File[];
  description: string;
  purchaseType: "Product" | "Other";
}

type PurchaseMode = "add" | "edit";

interface AddPurchaseDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseFormData) => void;
  mode?: PurchaseMode;
  initialData?: PurchasePayload; // API response of existing purchase
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const mapPurchaseToFormValues = (
  purchase: PurchasePayload,
): PurchaseFormData => ({
  date: dayjs(purchase.purchase_date),
  vendorName: purchase.vendor_name,
  vendorId: purchase.vendor_id,
  category: purchase.items?.[0]?.category_id || "",
  purchaseItems: purchase.items.map((item) => ({
    id: item.item_id,
    item_id: item.item_id,
    name: item.item_name,
    qty: item.quantity,
    // price: item.purchase_price,
    unit: item.unit,
    purchase_price: item.purchase_price,
    selling_price: item.selling_price,
    gst_tax: item.gst_tax,
    price: item.price,
    total_price: item.total,
  })),
  totalAmount: purchase.total_amount.toString(),
  amountPaid: purchase.paid_amount.toString(),
  paymentMethod: capitalize(purchase.payment_type),
  attachments: [], // keep empty (files can't be rehydrated)
  description: purchase.notes,
  purchaseType: purchase.purchase_type,
});

const AddPurchaseDrawerV2: React.FC<AddPurchaseDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  mode = "add",
  initialData,
}) => {
  console.log(mode, initialData, "<<< initialData in AddPurchaseDrawerV2");
  const [activeTab, setActiveTab] = useState<"Product" | "Other">("Product");
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [createNewItemOpen, setCreateNewItemOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemSelectorOpen, setItemSelectorOpen] = useState(false);
  const [existingFiles, setExistingFiles] = useState<
    { id: string; fileName: string; url: string }[]
  >([]);
  const branchId = useSelector(BranchId);
  const zoduId = useSelector(ZoduId);
  if (initialData && mode == "edit") {
    const updateData = mapPurchaseToFormValues(initialData);
    console.dir(updateData, { depth: null });
  }

  const [newVendor, setNewVendor] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
  });

  const {
    data: vendorResponse,
    isLoading: vendorsLoading,
    isError: vendorsError,
  } = useGetVendorsQuery(branchId);
  const vendors = vendorResponse?.Data || [];

  const { data: categoryData, isLoading: loadingCategories } =
    useGetMenuCategoryQuery(
      { branchId: branchId, type: activeTab },
      { refetchOnMountOrArgChange: true },
    );

  const { data: unitsData, isLoading: unitsLoading } =
    useGetUnitsListQuery(branchId);
  const units = unitsData?.Data || [];

  const [addVendor, { isLoading: vendorSaving }] = useAddVendorMutation();
  const [addPurchase, { isLoading: purchaseSaving }] = useAddPurchaseMutation();
  const [editPurchase, { isLoading: purchaseEditing }] =
    useEditPurchaseMutation();
  const isSaving =
    (mode === "add" && purchaseSaving) || (mode === "edit" && purchaseEditing);
  const itemType = activeTab === "Product" ? "direct" : "indirect";

  const { data: inventoryResponse, isLoading: itemsLoading } =
    useGetInventoryItemsQuery({
      branchId: branchId,
      type: itemType,
    });
  const inventoryItems = inventoryResponse?.Data || [];
  // console.log("branchId", branchId);

  // console.log("find", inventoryItems);

  const [categories, setCategories] = useState<CategoryData[]>([]);

  // Function to get unit ID by name
  const getUnitIdByName = (unitName: string): number => {
    if (!unitName) return 1; // Default to ID 1

    const unit = units.find(
      (u: UnitData) =>
        u.name?.toLowerCase() === unitName.toLowerCase() ||
        u.short_name?.toLowerCase() === unitName.toLowerCase(),
    );

    return unit?.id;
  };

  const handleRemoveExistingFile = (fileName: string) => {
    setExistingFiles((prev) =>
      prev.filter((file) => file.fileName !== fileName),
    );
  };

  const buttonText = (() => {
    if (mode === "edit") {
      return isSaving ? "Updating Purchase..." : "Update Purchase";
    }
    return isSaving ? "Creating Purchase..." : "Save Purchase";
  })();

  // Function to get unit name by ID
  const getUnitNameById = (unitId: number): string => {
    const unit = units.find((u: UnitData) => u.id === unitId);
    return unit?.name;
  };

  // Transform inventory items to match the item selector format
  const purchaseSelectorItems = inventoryItems?.map((item: any) => {
    const unitId = getUnitIdByName(item.item_unit);
    // console.log("INventory:", inventoryItems);
    // console.log("Unit: ", unitId);

    return {
      item_code: item.item_id,
      name: item.item_name,
      // unit_id: unitId, previous
      unit_id: item.item_unit, //current
      unit_name: item.unit_name,
    };
  });

  console.log("purchaseSelectorItems", purchaseSelectorItems);
  console.log("inventoryItems", inventoryItems);

  useEffect(() => {
    if (categoryData?.Data?.length) {
      const categoriesWithId = categoryData.Data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
      }));
      setCategories(categoriesWithId);
    }
  }, [categoryData]);

  useEffect(() => {
    if (initialData?.attachment_url) {
      console.log("Initial attachment_url:", initialData.attachment_url);
      const normalizedFiles = initialData.attachment_url.map((f: any) => ({
        id: f.id,
        fileName: f.fileName, // normalize key
        url: f.url,
      }));

      setExistingFiles(normalizedFiles);
    }
  }, [initialData]);

  const paymentMethods = [
    {
      label: "Cash",
      value: "Cash",
      icon: <PaymentsIcon fontSize="medium" />,
    },
    {
      label: "Card",
      value: "Card",
      icon: <CreditCardIcon fontSize="medium" />,
    },
    {
      label: "Others",
      value: "Others",
      icon: <MoreHorizIcon fontSize="medium" />,
    },
  ];

  const uploadFiles = async (files: File[]): Promise<AttachmentFile[]> => {
    if (!files || files.length === 0) {
      // console.log("❌ No files to upload");
      return [];
    }

    // console.log("📤 Uploading files:", files.length, "files", files);

    try {
      const uploadedResults: AttachmentFile[] = [];

      for (const file of files) {
        // console.log("📎 Uploading file:", file.name, file.type, file.size);

        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axiosInstance.post(
            apiConfig.uploadImage(),
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          // console.log("✅ Upload response for", file.name, ":", response.data);

          let fileUrl = "";

          if (response.data?.fileUrl) {
            fileUrl = response.data.fileUrl;
          } else if (response.data?.data?.fileUrl) {
            fileUrl = response.data.data.fileUrl;
          } else if (response.data?.url) {
            fileUrl = response.data.url;
          } else if (response.data?.path) {
            fileUrl = response.data.path;
          } else if (response.data?.location) {
            fileUrl = response.data.location;
          } else if (typeof response.data === "string") {
            fileUrl = response.data;
          }

          if (fileUrl) {
            uploadedResults.push({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              fileName: file.name, // Using lowercase filename
              url: fileUrl,
            });

            // console.log(
            //   "✅ Successfully uploaded:",
            //   file.name,
            //   "-> URL:",
            //   fileUrl
            // );
          } else {
            // console.error(
            //   "❌ Could not extract URL from response:",
            //   response.data
            // );
            toast.error(`Failed to upload ${file.name}`);
          }
        } catch (fileError: any) {
          // console.error("❌ Failed to upload file:", file.name, fileError);
          // console.error("Error response:", fileError.response?.data);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      // console.log(
      //   "📋 All uploads complete. Total:",
      //   uploadedResults.length,
      //   uploadedResults
      // );
      return uploadedResults;
    } catch (error: any) {
      // console.error("❌ File upload process failed:", error);
      toast.error("Failed to upload files. Please try again.");
      return [];
    }
  };

  const initialValues: PurchaseFormData = {
    date: dayjs(),
    vendorName: "",
    vendorId: "",
    category: "",
    purchaseItems: [],
    totalAmount: "",
    amountPaid: "",
    paymentMethod: "",
    attachments: [],
    description: "",
    purchaseType: "Product",
  };

  const validationSchema = Yup.object({
    vendorName: Yup.string().required("Vendor is required"),
    category: Yup.string().required("Category is required"),
     amountPaid: Yup.number().min(0, "Amount cannot be negative"),
    date: Yup.date().required("Date is required"),
     paymentMethod: Yup.string().when("amountPaid", {
        is: (val: any) => val !== undefined && val !== null && val !== "" && Number(val) > 0,
        then: (schema) => schema.required("Payment method is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
   
    description: Yup.string(),
  });

  const handleVendorSubmit = async () => {
    try {
      const payload = {
        zodu_id: zoduId,
        branch_id: branchId,
        vendor_name: newVendor.name.trim(),
        vendor_phone: newVendor.phone.trim(),
        vendor_email: newVendor.email.trim(),
        vendor_address: newVendor.address.trim(),
        company_name: newVendor.company.trim(),
      };

      await addVendor(payload).unwrap();

      setNewVendor({
        name: "",
        company: "",
        phone: "",
        email: "",
        address: "",
      });

      setAddVendorOpen(false);
      toast.success("Vendor added successfully");
    } catch (error) {
      // console.error("Vendor add failed:", error);
      toast.error("Failed to add vendor");
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      setCategories((prev) => [
        ...prev,
        {
          id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: newCategoryName.trim(),
        },
      ]);
      setNewCategoryName("");
      setAddCategoryOpen(false);
      toast.success("Category added");
    }
  };

  return (
    <>
      {/* <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            m: { xs: 2, sm: 4 },
            width: { xs: "calc(100% - 32px)", sm: "100%" },
            maxHeight: { xs: "calc(100vh - 32px)", sm: "90vh" },
          },
        }}> */}
      <Paper
        // elevation={4}
        sx={{
          width: "95%",
          // maxWidth: 1200,
          mx: "auto", // center horizontally
          my: 4,
          borderRadius: 2,
          overflow: "hidden", // important for sticky header/footer
        }}
      >
        <Formik
          //  enableReinitialize
          initialValues={
            mode === "edit" && initialData
              ? mapPurchaseToFormValues(initialData)
              : initialValues
          }
          // initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              setSubmitting(true);

              // console.log("📝 Purchase form values:", values);
              // console.log("📎 Attachments in form:", values.attachments);

              let uploadedFiles: AttachmentFile[] = [];
              if (values.attachments && values.attachments.length > 0) {
                toast.info(`Uploading ${values.attachments.length} file(s)...`);
                uploadedFiles = await uploadFiles(values.attachments);

                if (uploadedFiles.length === 0) {
                  toast.error("File upload failed. Please try again.");
                  setSubmitting(false);
                  return;
                }

                if (uploadedFiles.length < values.attachments.length) {
                  toast.warning(
                    `Only ${uploadedFiles.length} of ${values.attachments.length} files uploaded successfully.`,
                  );
                }
              }

              // console.log("✅ Uploaded files result:", uploadedFiles);

              const totalAmount = values.purchaseItems.reduce(
                (sum, item) => sum + item.qty * (item.price || 0),
                0,
              );

              console.log("purchase: ", values.purchaseItems);

              const payload: PurchasePayload = {
                zodu_id: zoduId,
                branch_id: branchId,
                vendor: values.vendorId,
                purchase_date: values.date.format("YYYY-MM-DD"),
                purchase_type: values.purchaseType,
                total_amount: parseFloat(totalAmount.toFixed(2)),
                paid_amount: parseFloat(
                  (parseFloat(values.amountPaid) || 0).toFixed(2),
                ),
                payment_type: values.paymentMethod.toLowerCase(),
                notes: values.description || "",
                attachment_url: uploadedFiles,
                items: values.purchaseItems.map((item) => ({
                  id: item.item_id,
                  name: item.name,
                  qty: item.qty,
                  unit: item.unit.toString(),
                  purchase_price: parseFloat((item.price || 0).toFixed(2)),
                  selling_price: parseFloat(
                    (item.selling_price || 0).toFixed(2),
                  ),
                  gst_tax: parseFloat((item.gst_tax || 0).toFixed(2)),
                  category_id: values.category,
                })),
              };

              if (mode === "edit" && initialData?.purchase_id) {
                console.log("Vendor", values);
                const attachment_url: AttachmentFile[] = [
                  ...(existingFiles ?? []),
                  ...(uploadedFiles ?? []),
                ];
                await editPurchase({
                  purchaseId: initialData.purchase_id,
                  ...payload,
                  attachment_url,
                }).unwrap();

                toast.success("Purchase updated successfully!");
                return;
              } 

              // console.log(
              //   "🚀 Final purchase payload being sent:",
              //   JSON.stringify(payload, null, 2)
              // );

              addPurchase(payload)
                .unwrap()
                .then(() => {
                  toast.success("Purchase created successfully!");
                  resetForm();
                  onClose();
                  onSubmit(values);
                })
                .catch((error) => {
                  console.error("❌ Create purchase error:", error);

                  // Check if it's the inventory update error
                  const errorMessage =
                    error?.data?.message || error?.message || "";

                  if (
                    errorMessage.includes("Unable to update Inventory") ||
                    errorMessage.includes("created_at") ||
                    errorMessage.includes("tbl_inventory")
                  ) {
                    // Purchase was created, but inventory update failed
                    toast.success("Purchase created successfully!");
                    resetForm();
                    onClose();
                    onSubmit(values);
                  } else {
                    // Show actual error for other issues
                    toast.error(
                      errorMessage ||
                        "Failed to create purchase. Please try again.",
                    );
                  }
                })
                .finally(() => {
                  setSubmitting(false);
                });
            } catch (error) {
              console.error("❌ Purchase submission error:", error);
              toast.error("An error occurred. Please try again.");
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting, touched, errors }) => {
           
            const calculatedTotal = values.purchaseItems.reduce(
              (sum: number, item: PurchaseItem) =>
                sum + item.qty * (item.price || 0),
              0,
            );

            const balanceAmount =
              values.amountPaid === ""
                ? 0
                : Math.max(calculatedTotal - Number(values.amountPaid || 0), 0);

            return (
              <>
              { console.log("errors", errors)}
                <Form>
                  {/* Header */}
                  <Box
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      bgcolor: "#fff",
                      pb: 1,
                      justifyContent: "space-between",
                      display: "flex",
                      alignItems: "center",
                      px: { xs: 2, sm: 3 },
                      pt: 2,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {mode === "edit" ? "Edit" : "Add"} Purchase
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    {/* Scrollable Content */}
                    <Box
                      sx={{
                        flexGrow: 1,
                        overflow: "auto",
                        pr: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 7 }} spacing={2} mb={2}>
                          {/* Date Picker */}
                          <Stack spacing={2}>
                            <Box>
                              <Typography sx={{ mb: 1 }}>
                                Purchase Date
                              </Typography>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  value={values.date}
                                  onChange={(newDate) => {
                                    if (newDate) {
                                      setFieldValue("date", newDate);
                                    }
                                  }}
                                  slotProps={{
                                    textField: {
                                      size: "small",
                                      fullWidth: true,
                                      error: false,
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                            </Box>

                            {/* Purchase Type */}
                            <Box>
                              <Typography sx={{ mb: 1 }}>
                                Purchase Type
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                {["Product", "Other"].map((tab) => (
                                  <Button
                                    key={tab}
                                    onClick={() => {
                                      setActiveTab(tab as "Product" | "Other");
                                      setFieldValue("purchaseType", tab);
                                    }}
                                    sx={{
                                      border:
                                        activeTab === tab
                                          ? "2px solid #dc2626"
                                          : "1px solid #878383ff",
                                      color:
                                        activeTab === tab
                                          ? "#dc2626"
                                          : "inherit",
                                      textTransform: "none",
                                      flex: 1,

                                      fontWeight: 600,
                                      bgcolor: "transparent",
                                      "&:hover": {
                                        bgcolor: "#f9f9f9",
                                      },
                                    }}
                                  >
                                    {tab}
                                  </Button>
                                ))}
                              </Box>
                            </Box>

                            {/* Vendor Name */}
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, md: 6 }} mb={2}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Vendor/Seller Name</InputLabel>
                                  <Select
                                    value={values.vendorId}
                                    label="Vendor/Seller Name"
                                    onChange={(e) => {
                                      console.log(e, "vendor selected");
                                      const selectedVendorId = e.target.value;

                                      const selectedVendor = vendors.find(
                                        (v: any) =>
                                          v.vendor_id === selectedVendorId,
                                      );
                                      setFieldValue(
                                        "vendorId",
                                        selectedVendorId,
                                      );
                                      setFieldValue(
                                        "vendorName",
                                        selectedVendor?.company_name || "",
                                      );
                                    }}
                                    MenuProps={{
                                      PaperProps: {
                                        sx: { maxHeight: 200 },
                                      },
                                    }}
                                  >
                                    {vendorsLoading && (
                                      <MenuItem disabled>
                                        Loading Vendors...
                                      </MenuItem>
                                    )}
                                    {vendorsError && (
                                      <MenuItem disabled>
                                        Error Loading
                                      </MenuItem>
                                    )}
                                    {vendors.map((vendor: any) => (
                                      <MenuItem
                                        key={vendor.vendor_id}
                                        value={vendor.vendor_id}
                                        // value={vendor.company_name}
                                      >
                                        {vendor.company_name}
                                      </MenuItem>
                                    ))}
                                    <MenuItem
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setAddVendorOpen(true);
                                      }}
                                      sx={{ color: "primary.main" }}
                                    >
                                      <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                                      Add Vendor
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                                 {touched.vendorName && errors.vendorName && (
                                                                <FormHelperText sx={{ p: 0, marginLeft: 0, color: 'red' }}>
                                                                  {errors.vendorName}
                                                                </FormHelperText>
                                  )}
                              </Grid>

                              {/* Category */}
                              <Grid size={{ xs: 12, md: 6 }} mb={2}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Category</InputLabel>
                                  <Select
                                    value={values.category}
                                    label="Category"
                                    onChange={(e) =>
                                      setFieldValue("category", e.target.value)
                                    }
                                    MenuProps={{
                                      PaperProps: { sx: { maxHeight: 200 } },
                                    }}
                                  >
                                    {loadingCategories && (
                                      <MenuItem disabled>
                                        Loading categories...
                                      </MenuItem>
                                    )}

                                    {!loadingCategories &&
                                      categories.length === 0 && (
                                        <MenuItem disabled>
                                          No categories found
                                        </MenuItem>
                                      )}

                                    {categories?.map(
                                      (category: CategoryData, index) => (
                                        <MenuItem
                                          key={category.id}
                                          value={category.id}
                                        >
                                          {category.name}
                                        </MenuItem>
                                      ),
                                    )}

                                    <MenuItem
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setAddCategoryOpen(true);
                                      }}
                                      sx={{ color: "primary.main" }}
                                    >
                                      <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                                      Add Category
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                                 {touched.category && errors.category && (
                                <FormHelperText sx={{ p: 0, marginLeft: 0, color: 'red' }}>
                                  {errors.category}
                                </FormHelperText>
                              )}
                              </Grid>
                            </Grid>

                            {/* Add Items Button */}
                            <Box>
                              <Button
                                fullWidth
                                startIcon={<AddIcon />}
                                onClick={() => setItemSelectorOpen(true)}
                                sx={{
                                  bgcolor: "#dc2626",
                                  color: "#fff",
                                  "&:hover": { bgcolor: "#b91c1c" },
                                }}
                              >
                                Add Items
                              </Button>

                              {/* Display Purchase Items */}

                              {values.purchaseItems.length > 0 && (
                                <Box
                                  sx={{
                                    mt: 2,
                                    p: 2,
                                    backgroundColor: "#f5f5f5",
                                    borderRadius: 2,
                                  }}
                                >
                                  <Typography variant="subtitle1">
                                    Selected Items
                                  </Typography>
                                  <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                  >
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>
                                            <b>Item</b>
                                          </TableCell>
                                          <TableCell align="center">
                                            <b>Qty</b>
                                          </TableCell>
                                          <TableCell align="right">
                                            <b>Price</b>
                                          </TableCell>
                                          <TableCell align="right">
                                            <b>Total</b>
                                          </TableCell>
                                          <TableCell align="center">
                                            <b>Action</b>
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>
                                      {/* {console.log("Rendering purchase items:", values.purchaseItems)} */}
                                      <TableBody>
                                        {values.purchaseItems.map(
                                          (item, index) => {
                                            const itemTotal =
                                              item.qty * (item.price || 0);

                                            return (
                                              <TableRow key={item.id} hover>
                                                {/* Item Name */}
                                                <TableCell>
                                                  <Typography fontWeight={500}>
                                                    {item.name}
                                                  </Typography>
                                                </TableCell>

                                                {/* Quantity */}
                                                <TableCell align="center">
                                                  <Box
                                                    sx={{
                                                      display: "inline-flex",
                                                      alignItems: "center",
                                                      // border: "1px solid #dc2626",
                                                      borderRadius: 1,
                                                    }}
                                                  >
                                                    <IconButton
                                                      size="small"
                                                      onClick={() => {
                                                        if (item.qty <= 1) {
                                                          setFieldValue(
                                                            "expenseItems",
                                                            values.purchaseItems.filter(
                                                              (_, i) =>
                                                                i !== index,
                                                            ),
                                                          );
                                                        } else {
                                                          const updated = [
                                                            ...values.purchaseItems,
                                                          ];
                                                          updated[index].qty -=
                                                            1;
                                                          setFieldValue(
                                                            "expenseItems",
                                                            updated,
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      <RemoveIcon fontSize="small" />
                                                    </IconButton>

                                                    <Typography
                                                      sx={{
                                                        px: 1,
                                                        minWidth: 24,
                                                        textAlign: "center",
                                                      }}
                                                    >
                                                      {item.qty}
                                                    </Typography>

                                                    <IconButton
                                                      size="small"
                                                      onClick={() => {
                                                        const updated = [
                                                          ...values.purchaseItems,
                                                        ];
                                                        updated[index].qty += 1;
                                                        setFieldValue(
                                                          "purchaseItems",
                                                          updated,
                                                        );
                                                      }}
                                                    >
                                                      <AddIcon fontSize="small" />
                                                    </IconButton>
                                                  </Box>
                                                </TableCell>
                                                {console.log(
                                                  "Values of purchase items:",
                                                  values.purchaseItems,
                                                )}
                                                {/* Price */}
                                                <TableCell align="right">
                                                  <TextField
                                                    size="small"
                                                    type="number"
                                                    sx={{ width: 100 }}
                                                    value={item.price || ""}
                                                    onChange={(e) => {
                                                      const updated = [
                                                        ...values.purchaseItems,
                                                      ];
                                                      updated[index].price =
                                                        Number(
                                                          e.target.value,
                                                        ) || 0;
                                                      setFieldValue(
                                                        "purchaseItems",
                                                        updated,
                                                      );
                                                    }}
                                                    inputProps={{ min: 0 }}
                                                  />
                                                </TableCell>

                                                {/* Total */}
                                                <TableCell align="right">
                                                  ₹{itemTotal.toFixed(2)}
                                                </TableCell>

                                                {/* Delete */}
                                                <TableCell align="center">
                                                  <IconButton
                                                    onClick={() =>
                                                      setFieldValue(
                                                        "purchaseItems",
                                                        values.purchaseItems.filter(
                                                          (_, i) => i !== index,
                                                        ),
                                                      )
                                                    }
                                                  >
                                                    <DeleteIcon color="error" />
                                                  </IconButton>
                                                </TableCell>
                                              </TableRow>
                                            );
                                          },
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Box>
                              )}
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }} spacing={2}>
                          <Stack spacing={2}>
                            {/* Total Amount */}
                            {/* <Box
                            display="flex"
                            justifyContent="space-between"
                            sx={{ mb: 2 }}
                          >
                            <Typography color="text.secondary">
                              Total Amount
                            </Typography>
                            <Typography fontWeight={600}>
                              ₹{calculatedTotal.toFixed(2)}
                            </Typography>
                          </Box> */}

                            {/* Paid Amount & Balance */}
                            {/* <Box
                            sx={{
                              display: "flex",
                              flexDirection: { xs: "column", md: "row" },
                              gap: 2,
                              alignItems: { xs: "stretch", md: "center" },
                            }}
                          >
                            <Box
                              sx={{
                                flex: { xs: 1, md: "0 0 auto" },
                                minWidth: { md: 200 },
                              }}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                label="Paid Amount"
                                type="number"
                                value={values.amountPaid}
                                onChange={(e) =>
                                  setFieldValue("amountPaid", e.target.value)
                                }
                                inputProps={{
                                  min: 0,
                                  step: "any",
                                }}
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <Typography
                                        sx={{ mr: 1, color: "text.secondary" }}
                                      >
                                        ₹
                                      </Typography>
                                    ),
                                  },
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flex: { xs: 1, md: "0 0 auto" },
                                minWidth: { md: 250 },
                                px: { xs: 0, md: 2 },
                              }}
                            >
                              <Typography color="text.secondary">
                                Balance Amount
                              </Typography>
                              <Typography
                                fontWeight={600}
                                color={
                                  balanceAmount > 0
                                    ? "error.main"
                                    : "success.main"
                                }
                              >
                                ₹{balanceAmount.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box> */}

                            <Box
                              sx={{
                                backgroundColor: "#f5f5f5",
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                              }}
                            >
                              <Box
                                display="flex"
                                // alignItems="center"
                                // justifyContent="space-between"
                                // sx={{ mb: 2, minWidth: { md: 250 } }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                  }}
                                >
                                  <Typography color="text.secondary">
                                    Total Amount
                                  </Typography>
                                  <Typography fontWeight={600} fontSize={40}>
                                    ₹{calculatedTotal.toFixed(2)}
                                  </Typography>
                                </Box>
                                {/* <Box></Box> */}
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: { xs: "column", md: "row" },
                                  justifyContent: "space-between",
                                  gap: 2,
                                  alignItems: { xs: "stretch", md: "center" },
                                }}
                              >
                                <Box
                                  sx={{
                                    flex: { xs: 1, md: "0 0 auto" },
                                    // minWidth: { md: 200 },
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Paid Amount"
                                    type="number"
                                    value={values.amountPaid}
                                    onChange={(e) =>
                                      setFieldValue(
                                        "amountPaid",
                                        e.target.value,
                                      )
                                    }
                                    inputProps={{
                                      min: 0,
                                      step: "any",
                                    }}
                                    slotProps={{
                                      input: {
                                        startAdornment: (
                                          <Typography
                                            sx={{
                                              mr: 1,
                                              color: "text.secondary",
                                            }}
                                          >
                                            ₹
                                          </Typography>
                                        ),
                                      },
                                    }}
                                  />
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: { xs: "row", md: "column" },
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flex: { xs: 1, md: "0 0 auto" },
                                    // minWidth: { md: 250 },
                                    // px: { xs: 0, md: 2 },
                                  }}
                                >
                                  <Typography color="text.secondary">
                                    Balance Amount
                                  </Typography>
                                  <Typography
                                    fontWeight={600}
                                    color={
                                      balanceAmount > 0
                                        ? "error.main"
                                        : "success.main"
                                    }
                                  >
                                    ₹{balanceAmount.toFixed(2)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            {/* Payment Method */}
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                Payment Method
                              </Typography>

                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(4, 1fr)",
                                  gap: 1.5,
                                }}
                              >
                                {paymentMethods.map((method) => {
                                  const isSelected =
                                    values.paymentMethod === method.value;

                                  return (
                                    <Box
                                      key={method.value}
                                      onClick={() =>
                                        setFieldValue(
                                          "paymentMethod",
                                          method.value,
                                        )
                                      }
                                      sx={{
                                        cursor: "pointer",
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: isSelected
                                          ? "primary.main"
                                          : "divider",
                                        backgroundColor: isSelected
                                          ? "primary.light"
                                          : "background.paper",
                                        p: 1.5,
                                        textAlign: "center",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          borderColor: "primary.main",
                                        },
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "center",
                                          mb: 0.5,
                                          color: isSelected
                                            ? "#ffff"
                                            : "text.secondary",
                                        }}
                                      >
                                        {method.icon}
                                      </Box>

                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: isSelected
                                            ? "#ffff"
                                            : "text.secondary",
                                        }}
                                        fontWeight={isSelected ? 600 : 400}
                                      >
                                        {method.label}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                              </Box>
                              {values.paymentMethod === "Others" && (
                                <Box sx={{ mt: 2 }}>
                                  <FormikTextInput
                                    name="paymentMethodOther"
                                    placeholder="Enter payment method"
                                    InputType="DrawerForm"
                                    label="Payment Method"
                                  />
                                </Box>
                              )}
                              {touched.paymentMethod &&
                                errors.paymentMethod && (
                                  <FormHelperText
                                    sx={{ color: "red", fontSize: 12 }}
                                  >
                                    {errors.paymentMethod}
                                  </FormHelperText>
                                )}
                            </Box>

                            {/* Attachments */}
                            <Box>
                              <Typography sx={{ mb: 1 }}>
                                Attachments
                              </Typography>
                              <MultiFileUpload
                                files={values.attachments}
                                existingFiles={existingFiles}
                                onRemoveExisting={(fileName: string) => {
                                  handleRemoveExistingFile(fileName);
                                }}
                                onChange={(files) =>
                                  setFieldValue("attachments", files)
                                }
                              />
                            </Box>

                            {/* Description */}
                            <Box>
                              <Typography sx={{ mb: 1 }}>Notes</Typography>
                              <TextField
                                fullWidth
                                placeholder="Description"
                                value={values.description}
                                onChange={(e) =>
                                  setFieldValue("description", e.target.value)
                                }
                                multiline
                                rows={4}
                                size="small"
                              />
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Submit Button */}
                    <Box
                      sx={{
                        position: "sticky",
                        bottom: 0,
                        zIndex: 10,
                        bgcolor: "#fff",
                        px: { xs: 2, sm: 3, md: 5 },
                        py: 2,
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                          bgcolor: "#dc2626",
                          "&:hover": { bgcolor: "#b91c1c" },
                        }}
                        disabled={isSubmitting || isSaving}
                      >
                        {buttonText}
                      </Button>
                    </Box>
                  </Box>
                </Form>

                {/* Purchase Item Selector Popup */}
                <PurchaseItemSelectorPopup
                  open={itemSelectorOpen}
                  items={purchaseSelectorItems}
                  existingItems={values.purchaseItems} // THIS IS THE KEY - pass current items
                  onClose={() => setItemSelectorOpen(false)}
                  onConfirm={(selectedItems: any[]) => {
                    console.log("Selected Items:", selectedItems);
                    const transformedItems = selectedItems.map((item) => ({
                      id: item.item_code,
                      item_id: item.item_code,
                      name: item.name,
                      qty: item.qty || 1,
                      price: item.price || 0,
                      unit: item.unit_id,
                      unit_name: item.unit_name,
                      purchase_price: item.price || 0,
                      selling_price: item.selling_price || 0,
                      gst_tax: item.gst_tax || 0,
                      total_price: (item.qty || 1) * (item.price || 0),
                    }));

                    const previousItemIds = values.purchaseItems.map(
                      (item) => item.item_id,
                    );
                    const newItemsCount = transformedItems.filter(
                      (item) => !previousItemIds.includes(item.item_id),
                    ).length;
                    console.log("Transformed Items:", transformedItems);
                    setFieldValue("purchaseItems", transformedItems);
                    setItemSelectorOpen(false);

                    // Show toast message
                    if (newItemsCount > 0) {
                      toast.success(
                        `${newItemsCount} item${
                          newItemsCount > 1 ? "s" : ""
                        } added successfully!`,
                      );
                    } else if (
                      transformedItems.length > values.purchaseItems.length
                    ) {
                      toast.success("Items updated successfully!");
                    }
                  }}
                />
              </>
            );
          }}
        </Formik>
      </Paper>
      {/* Add Vendor Dialog */}
      <Dialog
        open={addVendorOpen}
        onClose={() => setAddVendorOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Add New Vendor
            </Typography>
            <IconButton onClick={() => setAddVendorOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Vendor Name"
            placeholder="Vendor Name"
            value={newVendor.name}
            onChange={(e) =>
              setNewVendor({ ...newVendor, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label="Phone Number"
            placeholder="Phone Number"
            value={newVendor.phone}
            onChange={(e) =>
              setNewVendor({ ...newVendor, phone: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label="Email Address"
            placeholder="Enter Email Address"
            value={newVendor.email}
            onChange={(e) =>
              setNewVendor({ ...newVendor, email: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            size="small"
            label="Address"
            placeholder="Enter Address"
            value={newVendor.address}
            onChange={(e) =>
              setNewVendor({ ...newVendor, address: e.target.value })
            }
            sx={{ mb: 2 }}
            multiline
            rows={2}
          />

          <TextField
            fullWidth
            size="small"
            label="Company Name"
            placeholder="Enter Company Name"
            value={newVendor.company}
            onChange={(e) =>
              setNewVendor({ ...newVendor, company: e.target.value })
            }
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleVendorSubmit}
            disabled={!newVendor.name.trim() || vendorSaving}
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            {vendorSaving ? "Saving..." : "Save Vendor"}
          </Button>
        </Box>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Add Category
            </Typography>
            <IconButton onClick={() => setAddCategoryOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={!newCategoryName.trim()}
            onClick={handleAddCategory}
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            Add Category
          </Button>
        </Box>
      </Dialog>

      {/* Create New Item */}
      <CreateNewItem
        open={createNewItemOpen}
        onClose={() => setCreateNewItemOpen(false)}
      />
    </>
  );
};

export default AddPurchaseDrawerV2;
