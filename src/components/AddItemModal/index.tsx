import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import FormikTextInput from "@components/FormikTextInput/index.tsx";
import type { MenuItem as MenuItemType } from "../../types/menuItem";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MenuItemType) => void;
}

const categories = [
  "Bakery",
  "Meats",
  "Dairy",
  "Chicken",
  "Spices",
  "Fruit",
  "Nuts",
];

const AddItemModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Menu Item</DialogTitle>

      <Formik
        initialValues={{
          id: "",
          sku: "",
          name: "",
          category: "",
          sellPrice: 0,
          stock: 0,
          status: true,
          imageUrl: "",
        }}
        onSubmit={(values) => {
          onSubmit(values);
          onClose();
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <FormikTextInput name="sku" label="SKU / Item Code" />

              <FormikTextInput name="name" label="Menu Name" />

              {/* Category Select */}
              {/* <Typography variant="subtitle2">Category</Typography>
              <FormikTextInput name="category" label="Category" select>
                <option aria-label="None" value="" />
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </FormikTextInput> */}

              <FormikTextInput
                name="sellPrice"
                label="Sell Price"
                type="number"
              />

              <FormikTextInput name="stock" label="Stock" type="number" />

              <RadioGroup
                row
                name="status"
                value={values.status ? "active" : "inactive"}
                onChange={(e) =>
                  setFieldValue("status", e.target.value === "active")
                }
              >
                <FormControlLabel
                  value="active"
                  control={<Radio />}
                  label="Active"
                />
                <FormControlLabel
                  value="inactive"
                  control={<Radio />}
                  label="Inactive"
                />
              </RadioGroup>
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                Add Menu
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddItemModal;
