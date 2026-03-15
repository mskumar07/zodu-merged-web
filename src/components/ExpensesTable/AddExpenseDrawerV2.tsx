//Z-T94
import FormikTextInput from "@components/FormikTextInput";
import RemoveIcon from "@mui/icons-material/Remove";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { Grid } from "@mui/material";
import {
  Box,
  Checkbox,
  Dialog,
  Drawer,
  FormControl,
  FormHelperText,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import React, { useState,useEffect } from "react";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { BranchId, ZoduId } from "@store/slices/userSlice";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import Button from "../Button";
import CreateNewItem from "./CreateNewItem";
import { useAddExpenseCategoryMutation, useGetExpenseCategoriesQuery, useGetExpenseItemsQuery, useUpdateExpenseCategoryMutation } from "@store/services/expenseApi";
import ExpenseItemSelectorPopup from "./ExpenseItemSelectorPopup";
import MultiFileUpload from "@components/Common/Logo/MultiFileUpload";
import axiosInstance from "@store/services/axiosInstance";
import { apiConfig } from "@config/api";
import { useMutateCreateExpenses } from "@hooks/queryHooks/useMutateCreateExpenses";
import { useMutateCategoryExpenses } from "@hooks/queryHooks/useMutateCategoryExpenses";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";


interface AttachmentFile {
  id: string;
  filename: string;
  url: string;
}

interface ExpenseItem {
  id: string;
  item_id: string;
  name: string;
  qty: number;
  price: number|string;
}

interface ExpensePayloadItem {
  id: string;
  name: string;
  qty: number;
  purchase_price: number;
}

interface ExpensePayload {
  zodu_id: string;
  branch_id: string;
  category: number;
  expense_date: string;
  total_amount: number;
  paid_amount: number;
  attachment_url: AttachmentFile[];
  payment_type: string;
  description: string;
  items: ExpensePayloadItem[];
}

interface CategoryData {
  id: string;
  name: string;
}

interface ExpenseFormData {
  date: string;
  expenseItems: ExpenseItem[];
  category: string;
  totalAmount: string;
  amountPaid: string;
  paymentMethod: string;
  attachments: File[];
  description: string;
  billDate: Date|string;
}

interface AddExpensesDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  expense?: ExpenseFormData | null;
}

const ExpenseItems = [
  { id: "cat-001", name: "Office Supplies" },
  { id: "cat-002", name: "Travel" },
  { id: "cat-003", name: "Meals & Entertainment" },
  { id: "cat-004", name: "Equipment" },
  { id: "cat-005", name: "Utilities" },
  { id: "cat-006", name: "Marketing" },
  { id: "cat-007", name: "Training" },
  { id: "cat-008", name: "Other" },
];

const AddExpensesDrawerV2: React.FC<AddExpensesDrawerProps> = ({ open, onClose, onSubmit, expense}) => {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [createNewItemOpen, setCreateNewItemOpen] = useState(false);
  const [itemSelectorOpen, setItemSelectorOpen] = useState(false);
  const [existingFiles, setExistingFiles] = useState<
  { id: string; fileName: string; url: string }[]
>([]);

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


  const branchId = useSelector(BranchId);
  const zoduId = useSelector(ZoduId);
  const isEditMode = Boolean(expense?.expense_id);
  const { data: categories, isLoading: isCategoryLoading, refetch: refetchCategories } = useGetExpenseCategoriesQuery(branchId);
  const { data: expenseItemsData, isLoading: isExpenseItemsLoading, refetch: refetchExpenseItems } = useGetExpenseItemsQuery(branchId);
  const { mutate: createExpense, isPending: isCreating } = useMutateCreateExpenses({ refetch: refetchExpenseItems });
  const { mutate: addExpenseCategory, isPending: isAddingCategory } = useMutateCategoryExpenses({ refetch: refetchCategories });
  const [updateExpenseCategory, { isLoading: isUpdatingCategory , data: updatedCategory , error: updateCategoryError }] = useUpdateExpenseCategoryMutation();

  const uploadFiles = async (files: File[]): Promise<AttachmentFile[]> => {
    if (!files || files.length === 0) {
      console.log("❌ No files to upload");
      return [];
    }

    console.log("📤 Uploading files:", files.length, "files", files);

    try {
      const uploadedResults: AttachmentFile[] = [];

      // Upload each file individually
      for (const file of files) {
        console.log("📎 Uploading file:", file.name, file.type, file.size);

        const formData = new FormData();
        formData.append("file", file); // Use 'file' instead of 'files' for single upload

        try {
          const response = await axiosInstance.post(
            apiConfig.uploadImage(),
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("✅ Upload response for", file.name, ":", response.data);

          // Handle different possible response formats
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
              filename: file.name,
              url: fileUrl,
            });
            console.log(
              "✅ Successfully uploaded:",
              file.name,
              "-> URL:",
              fileUrl
            );
          } else {
            console.error(
              "❌ Could not extract URL from response:",
              response.data
            );
            toast.error(`Failed to upload ${file.name}`);
          }
        } catch (fileError: any) {
          console.error("❌ Failed to upload file:", file.name, fileError);
          console.error("Error response:", fileError.response?.data);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      console.log(
        "📋 All uploads complete. Total:",
        uploadedResults.length,
        uploadedResults
      );
      return uploadedResults;
    } catch (error: any) {
      console.error("❌ File upload process failed:", error);
      toast.error("Failed to upload files. Please try again.");
      return [];
    }
  };

  useEffect(() => {
  if (expense?.attachment_url) {
    const normalizedFiles = expense.attachment_url.map((f: any) => ({
      id: f.id,
      fileName: f.filename, // normalize key
      url: f.url,
    }));

    setExistingFiles(normalizedFiles);
  }
}, [expense]);

const handleRemoveExistingFile = (fileName: string) => {
  setExistingFiles((prev) =>
    prev.filter((file) => file.fileName !== fileName)
  );
};


  const initialValues: ExpenseFormData = {
    date: new Date().toISOString().split("T")[0],
    category: "",
    expenseItems: [],
    totalAmount: "",
    amountPaid: "",
    paymentMethod: "",
    attachments: [],
    description: "",
  };

const getInitialValues = (
  expense?: ExpenseData | null
): ExpenseFormData => {
  if (!expense) {
    return {
      date: new Date().toISOString().split("T")[0],
      category: "",
      expenseItems: [],
      totalAmount: "",
      amountPaid: "",
      paymentMethod: "",
      attachments: [],
      description: "",
    };
  }

  return {
    date: expense.expense_date
      ? expense.expense_date.split("T")[0]
      : "",

    category: expense.category_id || "",

    expenseItems:
      expense.items?.map((item: any) => ({
        id: item.item_id,
        item_id: item.item_id,
        name: item.item_name,
        qty: String(item.quantity),
        price: String(item.price),
      })) || [],

    totalAmount: String(expense.total_amount || ""),
    amountPaid: String(expense.paid_amount || ""),
    paymentMethod: expense.payment_type || "",
    attachments: [], // existing files remain on server
    description: expense.description || "",
  };
};


const response = getInitialValues(expense);
console.log("Initial Values for Formik:", response);



const validationSchema = Yup.object({
  category: Yup.string().required("Category is required"),
  date: Yup.string().required("Date is required"),

  amountPaid: Yup.string(),

  paymentMethod: Yup.string().when("amountPaid", {
    is: (val: any) => val !== undefined && val !== null && val !== "" && Number(val) > 0,
    then: (schema) => schema.required("Payment method is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  expenseItems: Yup.array()
    .min(1, "Please add at least one expense item")
    .test(
      "price-required",
      "Each expense item must have a price greater than 0",
      (items) => {
        if (!items || items.length === 0) return false;

        return items.every(
          (item: any) =>
            item.price !== null &&
            item.price !== undefined &&
            Number(item.price) > 0
        );
      }
    )
    .required(),

  totalAmount: Yup.string(),
  description: Yup.string(),
});


  // const paymentMethods = ["Card", "Cash", "UPI"];

const buildPayload = (
  values: ExpenseFormData,
  uploadedFiles: AttachmentFile[],
  existingFiles: AttachmentFile[]
): ExpensePayload => {
  // console.log("Expense Items in form values:", values.expenseItems);
  const attachment_url: AttachmentFile[] = [
    ...(existingFiles ?? []),
    ...(uploadedFiles ?? [])
  ];
  return {

  zodu_id: zoduId,
  branch_id: branchId,
  category: parseInt(values.category),
  expense_date: values.date,
  total_amount: parseFloat(
    values.expenseItems
      .reduce((sum, item) => sum + item.qty * (item.price || 0), 0)
      .toFixed(2)
  ),
  paid_amount: parseFloat((parseFloat(values.amountPaid) || 0).toFixed(2)),
  // attachment_url: uploadedFiles,
  attachment_url,
  payment_type: values.paymentMethod.toLowerCase(),
  description: values.description || "",
  items: values.expenseItems.map((item) => ({
    id: item.item_id,
    name: item.name,
    qty: item.qty,
    purchase_price: parseFloat((parseFloat(item.price) || 0).toFixed(2)),
  })),
}
};


  return (
    <>
    {/* <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          m: { xs: 2, sm: 4 },
          width: { xs: "calc(100% - 32px)", sm: "100%" },
          maxHeight: { xs: "calc(100vh - 32px)", sm: "90vh" },
        },
      }}
    > */}
    <Paper
  // elevation={4}
  sx={{
    width: "95%",
    // maxWidth: 1200,
    mx: "auto",          // center horizontally
    my: 4,
    borderRadius: 2,
    overflow: "hidden",  // important for sticky header/footer
  }}
>
      <Formik
        initialValues={getInitialValues(expense)}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            setSubmitting(true);

            if (values.amountPaid !== "" && !values.paymentMethod) {
              toast.error("Please select a payment method");
              return;
            }

            if (!values.expenseItems || values.expenseItems.length === 0) {
              toast.error("Please add at least one expense item");
              return;
            }
            if (values.expenseItems.some((item) => Number(item.price) <= 0)) {
              toast.error("All expense items must have a price greater than 0");
              return;
            }
              console.log("📝 Form values:", values);
              console.log("📎 Attachments in form:", values.attachments);
              console.log(
                "📊 Number of attachments:",
                values.attachments?.length || 0
              );

              // Upload files if any
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
                    `Only ${uploadedFiles.length} of ${values.attachments.length} files uploaded successfully.`
                  );
                }
              }

              console.log("✅ Uploaded files result:", uploadedFiles);


            const payload = buildPayload(values, uploadedFiles, existingFiles);

            console.log('🚀 Final payload being sent:', JSON.stringify(payload, null, 2));
            console.log("isEditMode:", isEditMode);
            if(isEditMode){
               const response = await updateExpenseCategory(
        {
          expense_id: expense!.expense_id, // 👈 make sure backend expects this
          ...payload,
        }
      ).unwrap();
        if(response?.data?.success){
              toast.success('Expense updated successfully!');
        }
            }else{
              createExpense(payload, {
              onSuccess: () => {
                toast.success('Expense created successfully!');
                resetForm();
                onClose();
                onSubmit(values);
              },
              onError: (error) => {
                toast.error(`Failed to create expense. ${error.response.data.errors}`);
              },
              onSettled: () => {
                setSubmitting(false);
              },
            });
            }
            
          } catch (error) {
            console.error('❌ Expense submission error:', error);
            toast.error('An error occurred. Please try again.');
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting, errors, touched }) => {
          const calculatedTotal = values.expenseItems.reduce(
            (sum: number, item: ExpenseItem) => sum + item.qty * (item.price || 0),
            0
          );

            const balanceAmount =
              values.amountPaid === ""
                ? 0
                : Math.max(calculatedTotal - Number(values.amountPaid || 0), 0);
            return (
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
                    Add Expenses
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
                    }}
                  >
                    <Grid container spacing={3}>
                      {/* Expense ID & Avatar */}
                      {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" color="error">
                    Expense Id : {values.expenseId}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "#67e8f9", fontSize: "14px" }}>DS</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Darrell Steward
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Warehouse
                      </Typography>
                    </Box>
                  </Box>
                </Box> */}

                      {/* Form Fields */}
                      <Grid size={{ xs: 12, md: 7 }} spacing={2}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6, mb: 2 }}>
                            <FormikTextInput
                              name="date"
                              placeholder="Date"
                              label="Date"
                              type="date"
                              InputType="DrawerForm"
                            />
                          </Grid>
                          {/* <FormikTextInput name="expenseName" placeholder="Expense Name" InputType="DrawerForm" /> */}
                          <Grid
                            size={{ xs: 12, md: 6, mb: 2 }}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: 1,
                            }}
                          >
                            <FormControl
                              fullWidth
                              size="small"
                              error={Boolean(
                                touched.category && errors.category,
                              )}
                            >
                              <InputLabel id="category-label">
                                Category
                              </InputLabel>
                              <Select
                                id="category"
                                labelId="category-label"
                                value={values.category}
                                label="Category"
                                onChange={(e) =>
                                  setFieldValue("category", e.target.value)
                                }
                              >
                                {isCategoryLoading ? (
                                  <MenuItem disabled>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography variant="body2">
                                        Loading categories...
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                ) : categories && categories.Data.length > 0 ? (
                                  categories.Data.map(
                                    (category: CategoryData) => (
                                      <MenuItem
                                        key={category.id}
                                        value={category.id}
                                      >
                                        {category.name}
                                      </MenuItem>
                                    ),
                                  )
                                ) : (
                                  <MenuItem disabled>
                                    No categories found
                                  </MenuItem>
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
                              {touched.category && errors.category && (
                                <FormHelperText sx={{ p: 0, marginLeft: 0 }}>
                                  {errors.category}
                                </FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Box>
                          <Button
                            fullWidth
                            startIcon={<AddIcon />}
                            onClick={() => setItemSelectorOpen(true)}
                            sx={{
                              bgcolor: "#dc2626",
                              color: "#fff",
                              marginTop: 2,
                              "&:hover": { bgcolor: "#b91c1c" },
                            }}
                          >
                            Add Items
                          </Button>

                          <ExpenseItemSelectorPopup
                            open={itemSelectorOpen}
                            items={expenseItemsData?.Data ?? []}
                            selectedItems={values.expenseItems}
                            onClose={() => setItemSelectorOpen(false)}
                            onConfirm={(selectedItems: ExpenseItem[]) => {
                              const total = selectedItems.reduce(
                                (sum, item) =>
                                  sum + item.qty * (item.price || 0),
                                0,
                              );

                              setFieldValue("expenseItems", selectedItems);
                              setFieldValue("totalAmount", total.toString());
                              setItemSelectorOpen(false);
                            }}
                          />

                          {values.expenseItems.length > 0 && (
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

                                  <TableBody>
                                    {values.expenseItems.map((item, index) => {
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
                                                      values.expenseItems.filter(
                                                        (_, i) => i !== index,
                                                      ),
                                                    );
                                                  } else {
                                                    const updated = [
                                                      ...values.expenseItems,
                                                    ];
                                                    updated[index].qty -= 1;
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
                                                    ...values.expenseItems,
                                                  ];
                                                  updated[index].qty += 1;
                                                  setFieldValue(
                                                    "expenseItems",
                                                    updated,
                                                  );
                                                }}
                                              >
                                                <AddIcon fontSize="small" />
                                              </IconButton>
                                            </Box>
                                          </TableCell>

                                          {/* Price */}
                                          <TableCell align="right">
                                            <TextField
                                              size="small"
                                              type="number"
                                              sx={{ width: 100 }}
                                              value={item.price || ""}
                                              onChange={(e) => {
                                                const updated = [
                                                  ...values.expenseItems,
                                                ];
                                                updated[index].price =
                                                  Number(e.target.value) || 0;
                                                setFieldValue(
                                                  "expenseItems",
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
                                                  "expenseItems",
                                                  values.expenseItems.filter(
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
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}
                        </Box>
                        {touched.expenseItems && errors.expenseItems && (
                          <FormHelperText sx={{ color: "red", fontSize: 12 }}>
                            {errors.expenseItems}
                          </FormHelperText>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, md: 5 }} spacing={2}>
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
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mb: 2, minWidth: { md: 250 } }}
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
                            <Box></Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: { xs: "column", md: "row" },
                              gap: 2,
                              alignItems: { xs: "stretch", md: "center" },
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                flex: { xs: 1, md: "0 0 auto" },
                                minWidth: { md: 200 },
                              }}
                            >
                              <FormikTextInput
                                name="amountPaid"
                                label="Paid Amount"
                                type="number"
                                InputType="DrawerForm"
                                InputProps={{
                                  inputProps: {
                                    min: 0,
                                    step: "any",
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
                        {/* <FormControl fullWidth size="small">
                          <InputLabel>Payment Method</InputLabel>
                          <Select
                            value={values.paymentMethod}
                            label="Payment Method"
                            onChange={(e) =>
                              setFieldValue("paymentMethod", e.target.value)
                            }
                          >
                            {paymentMethods.map((method) => (
                              <MenuItem key={method} value={method}>
                                {method}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl> */}
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
                                    setFieldValue("paymentMethod", method.value)
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
                                    onClick={() =>
                                      setFieldValue(
                                        "paymentMethod",
                                        method.value,
                                      )
                                    }
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
                                    onClick={() =>
                                      setFieldValue(
                                        "paymentMethod",
                                        method.value,
                                      )
                                    }
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
                          {touched.paymentMethod && errors.paymentMethod && (
                            <FormHelperText sx={{ color: "red", fontSize: 12 }}>
                              {errors.paymentMethod}
                            </FormHelperText>
                          )}
                        </Box>

                        {/* Attachments */}
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

                        <FormikTextInput
                          name="description"
                          placeholder="Description"
                          InputType="DrawerForm"
                          multiline
                          rows={4}
                        />

                        {/* Submit Button */}
                        <Box
                          sx={{
                            position: "sticky",
                            bottom: 0,
                            zIndex: 10,
                            bgcolor: "#fff",
                            // px: { xs: 2, sm: 3, md: 5 },
                            // py: 2,
                            borderTop: "1px solid #f0f0f0",
                          }}
                        >
                          {isEditMode ? (
                            <Button
                              type="submit"
                              variant="contained"
                              fullWidth
                              sx={{
                                bgcolor: "#dc2626",
                                "&:hover": { bgcolor: "#b91c1c" },
                              }}
                              disabled={isUpdatingCategory || isSubmitting}
                            >
                              {isSubmitting || isUpdatingCategory
                                ? "updating Expense..."
                                : "update Expense"}
                            </Button>
                          ) : (
                            <Button
                              type="submit"
                              variant="contained"
                              fullWidth
                              sx={{
                                bgcolor: "#dc2626",
                                "&:hover": { bgcolor: "#b91c1c" },
                              }}
                              disabled={isSubmitting || isCreating}
                            >
                              {isSubmitting || isCreating
                                ? "Creating Expense..."
                                : "Add Expense"}
                            </Button>
                          )}
                        </Box>
                        {/* Expense Items
                {values.expenseItems && values.expenseItems.length > 0 && (
                  <>
                    {values.expenseItems.map((item, index) => (
                      <CartItem
                        key={item.id}
                        name={item.productName}
                        id={item.id}
                        price={item.price}
                        quantity={item.count}
                        onRemove={(id) =>
                          setFieldValue(
                            "expenseItems",
                            values.expenseItems?.filter((expItem) => expItem.id !== id)
                          )
                        }
                        onPriceChange={(newPrice) => {
                          const updatedItems = values.expenseItems?.map((expItem) =>
                            expItem.id === item.id ? { ...expItem, price: newPrice, total: newPrice * expItem.count } : expItem
                          );
                          setFieldValue("expenseItems", updatedItems);
                        }}
                        onQuantityChange={(qty) => {
                          const updatedItems = values.expenseItems?.map((expItem) =>
                            expItem.id === item.id ? { ...expItem, count: qty, total: qty * expItem.price } : expItem
                          );
                          setFieldValue("expenseItems", updatedItems);
                        }}
                      />
                    ))}
                    <Typography color="info" variant="subtitle1" sx={{ cursor: "pointer" }} onClick={() => setCreateNewItemOpen(true)}>
                      + Create new item
                    </Typography>
                  </>
                )} */}
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Form>
            );}}
      </Formik>
      </Paper>

        {/* Add Items Drawer */}
        <Drawer
          anchor="bottom"
          open={addItemsOpen}
          onClose={() => setAddItemsOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: "100%", sm: 400 },
              bgcolor: "white",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              p: 0,
              ml: { xs: 0, sm: "auto" },
            },
          }}>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}>
              <Typography variant="h6" fontWeight="bold">
                Add Items
              </Typography>
              <IconButton
                onClick={() => setAddItemsOpen(false)}
                size="small"
                sx={{ color: "grey.500" }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <FormGroup>
              {ExpenseItems.map((category) => (
                <FormControlLabel
                  key={category.id}
                  control={<Checkbox value={category.id} />}
                  label={category.name}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "row-reverse",
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                />
              ))}
              <Button
                variant="contained"
                fullWidth
                sx={{ bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}>
                Done
              </Button>
            </FormGroup>
          </Box>
        </Drawer>

        {/* Add Category Drawer */}
        {/* <Drawer
        anchor="bottom"
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            bgcolor: "white",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            p: 0,
            ml: { xs: 0, sm: "auto" },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Add Category
            </Typography>
            <IconButton onClick={() => setAddCategoryOpen(false)} size="small" sx={{ color: "grey.500" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && newCategoryName.trim()) setAddCategoryOpen(false);
            }}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              if (newCategoryName.trim()) setAddCategoryOpen(false);
            }}
            sx={{ bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}
          >
            Add Category
          </Button>
        </Box>
      </Drawer> */}

        <CreateNewItem
          open={createNewItemOpen}
          onClose={() => setCreateNewItemOpen(false)}
        />
      {/* </Dialog> */}
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
            disabled={!newCategoryName.trim() || isAddingCategory}
            onClick={() => {
              const payload = {
                zodu_id: zoduId,
                branch_id: branchId,
                name: newCategoryName.trim(),
              };

              addExpenseCategory(payload, {
                onSuccess: () => {
                  toast.success("Category added successfully");
                  setNewCategoryName("");
                  setAddCategoryOpen(false);
                  refetchCategories();
                },
                onError: () => {
                  toast.error("Failed to add category");
                },
              });
            }}
            sx={{ bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}>
            Add Category
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default AddExpensesDrawerV2;
