import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import Button from "@components/Button";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import {
  useAddVendorMutation,
  useGetVendorsQuery,
  useGetMenuCategoryQuery,
  useGetInventoryItemsQuery,
  useGetUnitsListQuery,
  useEditPurchaseMutation,
} from "@store/services/menuApi";
import PurchaseItemSelectorPopup from "./PurchaseItemSelectorPopup";
import MultiFileUpload from "@components/Common/Logo/MultiFileUpload";
import { BranchId, ZoduId } from "@store/slices/userSlice";
import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";

interface AttachmentFile {
  fileName: string;
  url: string;
  type?: string;
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
  name: string;
  qty: number;
  price: number;
  unit: number;
  unit_name?: string;
  purchase_price: number;
  selling_price: number;
  gst_tax: number;
  total_price: number;
}

interface PurchaseFormData {
  date: dayjs.Dayjs;
  vendorName: string;
  category: string;
  purchaseItems: PurchaseItem[];
  totalAmount: string;
  amountPaid: string;
  paymentMethod: string;
  attachments: File[];
  description: string;
  purchaseType: "Product" | "Other";
  purchaseId?: string;
}

interface EditPurchaseDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseFormData) => void;
  editData?: any;
}

const EditPurchaseDrawer: React.FC<EditPurchaseDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  editData,
}) => {
  const [activeTab, setActiveTab] = useState<"Product" | "Other">("Product");
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [itemSelectorOpen, setItemSelectorOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [existingAttachments, setExistingAttachments] = useState<
    AttachmentFile[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const branchId = useSelector(BranchId);
  const zoduId = useSelector(ZoduId);
  console.log("exists attach:", existingAttachments);

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
    refetch: refetchVendors,
  } = useGetVendorsQuery(branchId);
  const vendors = vendorResponse?.Data || [];

  const { data: categoryData, isLoading: loadingCategories } =
    useGetMenuCategoryQuery(
      { branchId: branchId, type: activeTab },
      { refetchOnMountOrArgChange: true }
    );

  const { data: unitsData } = useGetUnitsListQuery(branchId);
  const units = unitsData?.Data || [];

  const [addVendor, { isLoading: vendorSaving }] = useAddVendorMutation();
  const [editPurchase, { isLoading: updateSaving }] = useEditPurchaseMutation();

  const itemType = activeTab === "Product" ? "direct" : "indirect";
  const { data: inventoryResponse } = useGetInventoryItemsQuery({
    branchId: branchId,
    type: itemType,
  });
  const inventoryItems = inventoryResponse?.Data || [];

  console.log(editData);

  const getUnitIdByName = (unitName: string): number => {
    if (!unitName) return 1;
    const unit = units.find(
      (u: UnitData) =>
        u.name?.toLowerCase() === unitName.toLowerCase() ||
        u.short_name?.toLowerCase() === unitName.toLowerCase()
    );
    return unit?.id || 1;
  };

  const getUnitNameById = (unitId: number): string => {
    const unit = units.find((u: UnitData) => u.id === unitId);
    return unit?.name || unit?.short_name || "";
  };

  const purchaseSelectorItems = useMemo(() => {
    console.log("Inventory Items:", inventoryItems);

    const inventoryItemsList =
      inventoryItems?.map((item: any) => ({
        item_code: item.item_id,
        name: item.item_name,
        unit_id: getUnitIdByName(item.item_unit),
        unit_name: item.item_unit,
        purchase_price: item.purchase_price || 0,
        selling_price: item.selling_price || 0,
        gst_tax: item.gst_tax || 0,
      })) || [];

    if (editData?.items) {
      const existingItems = editData.items.map((item: any) => ({
        item_code: item.id || item.item_id,
        name: item.name || item.item_name,
        unit_id: item.unit_id || getUnitIdByName(item.unit) || 1,
        unit_name:
          getUnitNameById(item.unit_id || getUnitIdByName(item.unit) || 1) ||
          item.unit,
        purchase_price: item.purchase_price || item.price || 0,
        selling_price: item.selling_price || 0,
        gst_tax: item.gst_tax || 0,
      }));

      const mergedItems = [...existingItems];
      inventoryItemsList.forEach((invItem: any) => {
        const exists = mergedItems.some(
          (item) => item.item_code === invItem.item_code
        );
        if (!exists) {
          mergedItems.push(invItem);
        }
      });

      return mergedItems;
    }

    return inventoryItemsList;
  }, [inventoryItems, editData, units]);

  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    if (open && editData) {
      const purchaseType =
        editData.purchase_type === "Product" ? "Product" : "Other";
      setActiveTab(purchaseType);

      if (editData.attachment_url && Array.isArray(editData.attachment_url)) {
        const attachments = editData.attachment_url.map(
          (url: any, index: number) => ({
            fileName: url.fileName,
            url: url.url,
            type: getFileTypeFromUrl(url.fileName),
          })
        );
        setExistingAttachments(attachments);
      }

      setIsLoading(false);
    }

    if (!open) {
      setIsLoading(true);
      setExistingAttachments([]);
    }
  }, [open, editData]);

  useEffect(() => {
    if (categoryData?.Data?.length) {
      const categoriesWithId = categoryData.Data.map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
      }));
      setCategories(categoriesWithId);
    }
  }, [categoryData]);

  const getFileTypeFromUrl = (url: any): string => {
    const ext = url?.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      default:
        return "application/octet-stream";
    }
  };

  const paymentMethods = [
    { label: "Cash", value: "cash" },
    { label: "Card", value: "card" },
    { label: "UPI", value: "upi" },
    { label: "Credit", value: "credit" },
  ];

  const initialValues = useMemo((): PurchaseFormData => {
    if (!editData) {
      return {
        date: dayjs(),
        vendorName: "",
        category: "",
        purchaseItems: [],
        totalAmount: "",
        amountPaid: "",
        paymentMethod: "cash",
        attachments: [],
        description: "",
        purchaseType: "Product",
      };
    }
    console.log("Edit data:", editData);

    const purchaseItems = Array.isArray(editData.items)
      ? editData.items.map((item: any, index: number) => {
          const unitId = getUnitIdByName(item.item_unit) || 1;
          return {
            item_id: item.item_id,
            name: item.item_name,
            qty: item.quantity || 1,
            price: item.price || 0,
            unit: unitId,
            unit_name: getUnitNameById(unitId),
            purchase_price: item.purchase_price || item.price || 0,
            selling_price: item.selling_price || 0,
            gst_tax: item.gst_tax || 0,
            total_price: item.total || 0,
          };
        })
      : [];

    let vendorValue = "";
    if (editData.vendor_id) {
      vendorValue = editData.vendor_id;
    } else if (editData.vendor_name || editData.vendor) {
      const vendor = vendors.find(
        (v) =>
          v.company_name === (editData.vendor_name || editData.vendor) ||
          v.vendor_name === (editData.vendor_name || editData.vendor)
      );
      vendorValue = vendor?.vendor_id || "";
    }

    let categoryValue = "";
    const firstItem = editData.items?.[0];
    if (firstItem?.category_id) {
      categoryValue = firstItem.category_id.toString();
    } else if (firstItem?.category) {
      const category = categories.find((c) => c.name === firstItem.category);
      categoryValue = category?.id || "";
    }

    return {
      date: dayjs(editData.purchase_date || new Date()),
      vendorName: vendorValue,
      category: categoryValue,
      purchaseItems: purchaseItems,
      totalAmount: (editData.total_amount || 0).toString(),
      amountPaid: (editData.paid_amount || 0).toString(),
      paymentMethod: (editData.payment_type || "cash").toLowerCase(),
      attachments: [],
      description: editData.notes || "",
      purchaseType: editData.purchase_type,
      purchaseId: editData.purchase_id || editData.id,
    };
  }, [editData, vendors, categories, units]);

  const validationSchema = Yup.object({
    vendorName: Yup.string().required("Vendor is required"),
    category: Yup.string().required("Category is required"),
    date: Yup.date().required("Date is required"),
    paymentMethod: Yup.string().required("Payment method is required"),
    amountPaid: Yup.number().min(0, "Amount cannot be negative"),
    description: Yup.string(),
  });

  console.log(existingAttachments);

  const handledeleteAttachment = async (fileName: string) => {
    setExistingAttachments((prev) =>
      prev.filter((file) => file.fileName !== fileName)
    );

    try {
      await axiosInstance.delete(apiConfig.deleteImage(fileName));
      toast.success("Attachment deleted");
    } catch (error) {
      toast.error("Failed to delete from server, but removed locally");
      console.error("Delete error:", error);
    }
  };

  const uploadFiles = async (files: File[]): Promise<AttachmentFile[]> => {
    if (!files || files.length === 0) return [];

    try {
      const uploadedResults: AttachmentFile[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axiosInstance.post(
            apiConfig.uploadImage(),
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          let fileUrl = "";
          if (response.data?.fileUrl) {
            fileUrl = response.data.fileUrl;
          } else if (response.data?.data?.fileUrl) {
            fileUrl = response.data.data.fileUrl;
          } else if (response.data?.url) {
            fileUrl = response.data.url;
          } else if (response.data?.path) {
            fileUrl = response.data.path;
          } else if (typeof response.data === "string") {
            fileUrl = response.data;
          }

          if (fileUrl) {
            uploadedResults.push({
              fileName: file.name,
              url: fileUrl,
              type: file.type,
            });
          }
        } catch (error) {
          // console.error("Failed to upload file:", file.name, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      return uploadedResults;
    } catch (error) {
      // console.error("File upload process failed:", error);
      toast.error("Failed to upload files. Please try again.");
      return [];
    }
  };

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
      refetchVendors();
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
  console.log("category:", categories);

  const handleSubmit = async (values: PurchaseFormData) => {
    try {
      let newUploadedFiles: AttachmentFile[] = [];
      if (values.attachments && values.attachments.length > 0) {
        toast.info(`Uploading ${values.attachments.length} file(s)...`);
        newUploadedFiles = await uploadFiles(values.attachments);
      }

      const allAttachments = [...existingAttachments, ...newUploadedFiles];

      const totalAmount = values.purchaseItems.reduce(
        (sum, item) => sum + item.qty * (item.price || 0),
        0
      );

      const payload = {
        zodu_id: zoduId,
        branch_id: branchId,
        purchaseId: values.purchaseId,
        vendor: values.vendorName,
        purchase_date: values.date.format("YYYY-MM-DD"),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        paid_amount: parseFloat(
          (parseFloat(values.amountPaid) || 0).toFixed(2)
        ),
        purchase_type: values.purchaseType,
        attachment_url: allAttachments.map((file) => file),
        payment_type: values.paymentMethod,
        notes: values.description || "",
        items: values.purchaseItems.map((item) => ({
          id: item.item_id || item.id,
          name: item.name,
          category_id: parseInt(values.category),
          qty: item.qty,
          unit: item.unit.toString(),
          purchase_price: parseFloat(Number(item.price || 0).toFixed(2)),
          selling_price: parseFloat(Number(item.selling_price || 0).toFixed(2)),
          gst_tax: parseFloat((item.gst_tax || 0).toFixed(2)),
        })),
      };

      if (values.purchaseId) {
        await editPurchase(payload).unwrap();
        toast.success("Purchase updated successfully!");
        onClose();
        onSubmit(values);
      }
    } catch (error: any) {
      // console.error("Update purchase error:", error);
      const errorMessage = error?.data?.message || error?.message || "";
      toast.error(
        errorMessage || "Failed to update purchase. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading purchase data...</Typography>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog
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
      }}>
      <Formik
        key={`edit-purchase-${editData?.purchase_id || editData?.id || "new"}`}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}>
        {({ values, setFieldValue, isSubmitting }) => {
          const calculatedTotal = values.purchaseItems.reduce(
            (sum: number, item: PurchaseItem) =>
              sum + item.qty * (item.price || 0),
            0
          );

          const balanceAmount = Math.max(
            calculatedTotal - Number(values.amountPaid || 0),
            0
          );

          return (
            <Form>
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
                }}>
                <Typography variant="h6" fontWeight="bold">
                  Edit Purchase {values.purchaseId && `#${values.purchaseId}`}
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
                }}>
                <Box
                  sx={{
                    flexGrow: 1,
                    overflow: "auto",
                    pr: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}>
                  <Box>
                    <Typography sx={{ mb: 1 }}>Purchase Date</Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={values.date}
                        onChange={(newDate) => {
                          if (newDate) setFieldValue("date", newDate);
                        }}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>

                  <Box>
                    <Typography sx={{ mb: 1 }}>Purchase Type</Typography>
                    <Box sx={{ display: "flex" }}>
                      {["Product", "Other"].map((tab) => (
                        <Button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab as "Product" | "Other");
                            setFieldValue("purchaseType", tab);
                          }}
                          sx={{
                            border:
                              values.purchaseType === tab
                                ? "2px solid #dc2626"
                                : "2px solid transparent",
                            color:
                              values.purchaseType === tab
                                ? "#dc2626"
                                : "inherit",
                            textTransform: "none",
                            flex: 1,
                            fontWeight: 600,
                            bgcolor: "transparent",
                            "&:hover": {
                              bgcolor: "#f9f9f9",
                            },
                          }}>
                          {tab}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  <FormControl fullWidth size="small">
                    <InputLabel>Vendor/Seller Name</InputLabel>
                    <Select
                      value={values.vendorName}
                      label="Vendor/Seller Name"
                      onChange={(e) =>
                        setFieldValue("vendorName", e.target.value)
                      }
                      MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                      {vendorsLoading && (
                        <MenuItem disabled>Loading...</MenuItem>
                      )}
                      {vendors.map((vendor: any) => (
                        <MenuItem
                          key={vendor.vendor_id}
                          value={vendor.vendor_id}>
                          {vendor.company_name || vendor.vendor_name}
                        </MenuItem>
                      ))}
                      <MenuItem
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAddVendorOpen(true);
                        }}
                        sx={{ color: "primary.main" }}>
                        <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                        Add Vendor
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={values.category}
                      label="Category"
                      onChange={(e) =>
                        setFieldValue("category", e.target.value)
                      }
                      MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}>
                      {loadingCategories && (
                        <MenuItem disabled>Loading...</MenuItem>
                      )}
                      {categories.map((category: CategoryData) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                      <MenuItem
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAddCategoryOpen(true);
                        }}
                        sx={{ color: "primary.main" }}>
                        <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                        Add Category
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Button
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={() => setItemSelectorOpen(true)}
                      sx={{
                        bgcolor: "#dc2626",
                        color: "#fff",
                        "&:hover": { bgcolor: "#b91c1c" },
                      }}>
                      {values.purchaseItems.length > 0
                        ? "Add/Modify Items"
                        : "Add Items"}
                    </Button>

                    <PurchaseItemSelectorPopup
                      open={itemSelectorOpen}
                      items={purchaseSelectorItems}
                      existingItems={values.purchaseItems} // Already passing
                      onClose={() => setItemSelectorOpen(false)}
                      onConfirm={(selectedItems: any[]) => {
                        const transformedItems = selectedItems.map((item) => {
                          const existingItem = values.purchaseItems.find(
                            (pItem) => pItem.item_id === item.item_code
                          );

                          if (existingItem) {
                            return {
                              ...existingItem,
                              name: item.name,
                              unit: item.unit_id,
                              unit_name: item.unit_name,
                              qty: item.qty || existingItem.qty,
                              price: item.price || existingItem.price,
                            };
                          }

                          return {
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
                          };
                        });

                        const previousItemIds = values.purchaseItems.map(
                          (item) => item.item_id
                        );
                        const newItemsCount = transformedItems.filter(
                          (item) => !previousItemIds.includes(item.item_id)
                        ).length;

                        const updatedItemsCount = transformedItems.filter(
                          (item) => previousItemIds.includes(item.item_id)
                        ).length;

                        setFieldValue("purchaseItems", transformedItems);
                        setItemSelectorOpen(false);

                        // Show appropriate toast message
                        if (newItemsCount > 0 && updatedItemsCount > 0) {
                          toast.success(
                            `${newItemsCount} new item${
                              newItemsCount > 1 ? "s" : ""
                            } added and ${updatedItemsCount} item${
                              updatedItemsCount > 1 ? "s" : ""
                            } updated!`
                          );
                        } else if (newItemsCount > 0) {
                          toast.success(
                            `${newItemsCount} item${
                              newItemsCount > 1 ? "s" : ""
                            } added successfully!`
                          );
                        } else if (updatedItemsCount > 0) {
                          toast.success(
                            `${updatedItemsCount} item${
                              updatedItemsCount > 1 ? "s" : ""
                            } updated successfully!`
                          );
                        }
                      }}
                    />

                    {values.purchaseItems.length > 0 && (
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}>
                        {values.purchaseItems.map((item, index) => {
                          const displayUnit =
                            item.unit_name || getUnitNameById(item.unit);

                          return (
                            <Box
                              key={item.id}
                              sx={{
                                border: "1px solid #eee",
                                borderRadius: 2,
                                p: 1.5,
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "stretch", sm: "center" },
                                justifyContent: "space-between",
                                gap: { xs: 1.5, sm: 1 },
                              }}>
                              <Box sx={{ flex: { xs: "1", sm: "0 0 auto" } }}>
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    mb: { xs: 1, sm: 0 },
                                  }}>
                                  {item.name}
                                  {displayUnit && (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{ ml: 1, color: "text.secondary" }}>
                                      ({displayUnit})
                                    </Typography>
                                  )}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    border: "1px solid #dc2626",
                                    borderRadius: 1,
                                    width: "fit-content",
                                  }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      if (item.qty <= 1) {
                                        setFieldValue(
                                          "purchaseItems",
                                          values.purchaseItems.filter(
                                            (_, i) => i !== index
                                          )
                                        );
                                      } else {
                                        const updated = [
                                          ...values.purchaseItems,
                                        ];
                                        updated[index].qty -= 1;
                                        setFieldValue("purchaseItems", updated);
                                      }
                                    }}>
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <Typography
                                    sx={{
                                      px: 1,
                                      fontWeight: 600,
                                      minWidth: 30,
                                      textAlign: "center",
                                    }}>
                                    {item.qty}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      const updated = [...values.purchaseItems];
                                      updated[index].qty += 1;
                                      setFieldValue("purchaseItems", updated);
                                    }}>
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: { xs: 1, sm: 2 },
                                  width: { xs: "100%", sm: "auto" },
                                }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  placeholder="Price"
                                  sx={{ width: { xs: "100%", sm: 200 } }}
                                  value={
                                    !item.price || item.price === 0
                                      ? ""
                                      : Number(item.price)
                                  }
                                  onChange={(e) => {
                                    const updated = [...values.purchaseItems];
                                    const inputValue = e.target.value;
                                    if (
                                      inputValue === "" ||
                                      inputValue === null ||
                                      inputValue === undefined
                                    ) {
                                      updated[index].price = 0;
                                      updated[index].purchase_price = 0;
                                    } else {
                                      const numValue = parseFloat(inputValue);
                                      updated[index].price = isNaN(numValue)
                                        ? 0
                                        : numValue;
                                      updated[index].purchase_price = isNaN(
                                        numValue
                                      )
                                        ? 0
                                        : numValue;
                                    }
                                    setFieldValue("purchaseItems", updated);
                                  }}
                                  inputProps={{
                                    min: 0,
                                    step: "any",
                                    pattern: "[0-9]*[.]?[0-9]*",
                                  }}
                                />
                                <IconButton
                                  onClick={() =>
                                    setFieldValue(
                                      "purchaseItems",
                                      values.purchaseItems.filter(
                                        (_, i) => i !== index
                                      )
                                    )
                                  }
                                  sx={{ flexShrink: 0 }}>
                                  <DeleteIcon color="error" />
                                </IconButton>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}>
                    <Typography color="text.secondary">Total Amount</Typography>
                    <Typography fontWeight={600}>
                      ₹ {calculatedTotal.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 2,
                      alignItems: { xs: "stretch", md: "center" },
                    }}>
                    <Box
                      sx={{
                        flex: { xs: 1, md: "0 0 auto" },
                        minWidth: { md: 200 },
                      }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Paid Amount"
                        type="number"
                        value={values.amountPaid}
                        onChange={(e) =>
                          setFieldValue("amountPaid", e.target.value)
                        }
                        inputProps={{ min: 0, step: "any" }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <Typography
                                sx={{ mr: 1, color: "text.secondary" }}>
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
                      }}>
                      <Typography color="text.secondary">
                        Balance Amount
                      </Typography>
                      <Typography
                        fontWeight={600}
                        color={
                          balanceAmount > 0 ? "error.main" : "success.main"
                        }>
                        ₹{balanceAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>

                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={values.paymentMethod}
                      label="Payment Method"
                      onChange={(e) =>
                        setFieldValue("paymentMethod", e.target.value)
                      }>
                      {paymentMethods.map((method) => (
                        <MenuItem key={method.label} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography sx={{ mb: 1 }}>Attachments</Typography>
                    <MultiFileUpload
                      files={values.attachments}
                      existingFiles={existingAttachments.map((file) => ({
                        id: file.fileName,
                        fileName: file.fileName, // Using lowercase filename
                        url: file.url,
                      }))}
                      onChange={(files) => setFieldValue("attachments", files)}
                      onRemoveExisting={(fileName) =>
                        handledeleteAttachment(fileName)
                      }
                    />
                  </Box>

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
                </Box>

                <Box
                  sx={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 10,
                    bgcolor: "#fff",
                    px: { xs: 2, sm: 3, md: 5 },
                    py: 2,
                    borderTop: "1px solid #f0f0f0",
                    mt: 2,
                  }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: "#dc2626",
                      "&:hover": { bgcolor: "#b91c1c" },
                    }}
                    disabled={isSubmitting || updateSaving}>
                    {isSubmitting || updateSaving
                      ? "Updating Purchase..."
                      : "Update Purchase"}
                  </Button>
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>

      <Dialog
        open={addVendorOpen}
        onClose={() => setAddVendorOpen(false)}
        fullWidth
        maxWidth="xs">
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}>
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
            value={newVendor.address}
            onChange={(e) =>
              setNewVendor({ ...newVendor, address: e.target.value })
            }
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Company Name"
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
            sx={{ bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}>
            {vendorSaving ? "Saving..." : "Save Vendor"}
          </Button>
        </Box>
      </Dialog>

      <Dialog
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        fullWidth
        maxWidth="xs">
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}>
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
            sx={{ bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}>
            Add Category
          </Button>
        </Box>
      </Dialog>
    </Dialog>
  );
};

export default EditPurchaseDrawer;
