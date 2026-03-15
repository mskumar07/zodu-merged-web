//Z-T87 updated Item view modal
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import FormikTextInput from "@components/FormikTextInput"; // your reusable Formik input
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// ✅ Props
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialData: {
    inventory_id: number;
    stock_qty: number;
    stock_alert: number;
    selling_price: number;
    purchase_price: number;
    last_purchase_date: string;
  };
}

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  return isoDate.split("T")[0]; // Extracts only 'YYYY-MM-DD'
};

// ✅ Validation Schema
const validationSchema = Yup.object().shape({
  stock_qty: Yup.number().required("Required"),
  stock_alert: Yup.number().required("Required"),
  selling_price: Yup.number().required("Required"),
  purchase_price: Yup.number().required("Required"),
  last_purchase_date: Yup.date().required("Required"),
});

// ✅ Main Component
const InventoryModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const initialValues = {
    inventory_id: initialData?.inventory_id ?? "",
    stock_qty: initialData?.stock_qty ?? 0,
    stock_alert: initialData?.stock_alert ?? 0,
    selling_price: initialData?.selling_price ?? 0,
    purchase_price: initialData?.purchase_price ?? 0,
    last_purchase_date: formatDate(initialData?.last_purchase_date) ?? "",
  };



  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => {
          onSubmit(values);
          resetForm();
          onClose();
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
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
                  Edit Inventory
                </Typography>
                <IconButton onClick={onClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Scrollable Form Content */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Inventory ID: <strong>{values.inventory_id}</strong>
                </Typography>

                <FormikTextInput
                  name="stock_qty"
                  label="Stock Quantity"
                  type="number"
                  InputType="DrawerForm"
                />

                <FormikTextInput
                  name="stock_alert"
                  label="Stock Alert Leve"
                  type="number"
                  InputType="DrawerForm"
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormikTextInput
                    name="selling_price"
                    label="Selling Price"
                    type="number"
                    InputType="DrawerForm"
                  />
                  <FormikTextInput
                    name="purchase_price"
                    label="Purchase Price"
                    type="number"
                    InputType="DrawerForm"
                  />
                </Box>

                <FormikTextInput
                  name="last_purchase_date"
                  label="Last Purchase Date"
                  type="date"
                  InputType="DrawerForm"
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ pt: 2, borderTop: "1px solid #f0f0f0" }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#dc2626",
                    "&:hover": { bgcolor: "#b91c1c" },
                  }}
                  disabled={isSubmitting}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default InventoryModal;
