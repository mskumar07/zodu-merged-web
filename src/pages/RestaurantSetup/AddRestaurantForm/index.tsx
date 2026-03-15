import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikSectionGrid from "@components/FormikSectionGrid/index";
import { Typography, Box, Grid, Divider, Stack, Paper } from "@mui/material";
import Button from "@components/Button";
import styles from "./index.module.css"; // Optional for layout styling
import Group from "../../../assets/icons/MenuIcons/Group.svg";

const validationSchema = Yup.object({
  mobile: Yup.string(),
  email: Yup.string(),
  ownerName: Yup.string(),
  gst: Yup.string(),
  addressLine1: Yup.string(),
  addressLine2: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  distrct: Yup.string(),
  pincode: Yup.string(),
  accountNumber: Yup.string(),
  accountType: Yup.string(),
  ifscCode: Yup.string(),
});

const initialValues = {
  mobile: "",
  email: "",
  ownerName: "",
  gst: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  distrct: "",
  accountNumber: "",
  accountType: "",
  ifscCode: "",
};

const AddRestaurantForm: React.FC = () => {
  const [isBranchSaved, setIsBrachSaved] = useState<Boolean>(false);
  const handleAddBranch = () => {
    setIsBrachSaved(true);
  };
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          minHeight: "70px",
          alignItems: "center",
        }}
      >
        <Box>
          <img src={Group} />
        </Box>
        <Box>
          <Typography color="primary">Zodu Id: Zodu123456</Typography>
        </Box>
      </Box>
      <Typography
        variant="h5"
        color="textDisabled"
        ml={3}
        sx={{ minHeight: "50px" }}
      >
        Restaurnat/ Company Name
      </Typography>
      <Paper
        elevation={2}
        sx={{
          backgorundColor: "#FAFAFA",
          border: "1px solid #f0f0f0",
        }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log(values);
          }}
        >
          <Form className={styles.form}>
            <Stack gap={2}>
              <FormikSectionGrid
                title="Basic Details"
                minHeight="50px"
                padding={1.5}
                fields={[
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  },
                  {
                    name: "ownerName",
                    label: "Owner / Admin Name",
                    isRequired: true,
                    placeholder: "ABDUL KALAM",
                    size: { xs: 12, md: 2.8 },
                  },
                  {
                    name: "mobile",
                    label: "Mobile",
                    isRequired: true,
                    placeholder: "+91 8222222222",
                    size: { xs: 12, md: 2.9 },
                  },
                  {
                    name: "email",
                    label: "Mail Id",
                    isRequired: true,
                    placeholder: "abc@gmail.com",
                    size: { xs: 12, md: 2.9 },
                  },
                  {
                    name: "gst",
                    label: "GST",
                    isRequired: true,
                    placeholder: "1234534",
                    size: { xs: 12, md: 2.9 },
                  },
                ]}
              />

              <FormikSectionGrid
                title="Address Details"
                minHeight="160px"
                padding={1.5}
                fields={[
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  },
                  {
                    name: "pincode",
                    label: "Pincode",
                    isRequired: true,
                    placeholder: "Eg: Placeholder",
                    size: { xs: 12, md: 2.8 },
                  },
                  {
                    name: "city",
                    label: "City",
                    isRequired: true,
                    placeholder: "Eg: City",
                    size: { xs: 12, md: 2.9 },
                    isDisabled: true,
                  },
                  {
                    name: "district",
                    label: "District",
                    isRequired: true,
                    placeholder: "Eg: City",
                    size: { xs: 12, md: 2.9 },
                    isDisabled: true,
                  },
                  {
                    name: "state",
                    label: "State",
                    isRequired: true,
                    placeholder: "Eg: City",
                    size: { xs: 12, md: 2.9 },
                    isDisabled: true,
                  },
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  },
                  {
                    name: "addressLine1",
                    label: "Floor / Building No / Flat No",
                    placeholder: "#22, SRI SAI BABA NAGAR,",
                    size: { xs: 12, md: 5.7 },
                  },
                  {
                    name: "addressLine2",
                    label: "Area / Street Name",
                    placeholder: "KUWAIT MAIN STREET, SAL...",
                    size: { xs: 12, md: 5.8 },
                  },
                ]}
              />

              <FormikSectionGrid
                title="Bank Details"
                padding={1.5}
                minHeight="50px"
                fields={[
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  },
                  {
                    name: "accountNumber",
                    label: "Account Number",
                    placeholder: "21458522488244212",
                    size: { xs: 12, md: 2.8 },
                  },
                  {
                    name: "accountType",
                    label: "Account Type",
                    placeholder: "Current Account",
                    size: { xs: 12, md: 2.8 },
                  },
                  {
                    name: "ifscCode",
                    label: "IFSC Code",
                    placeholder: "HDFC022128",
                    size: { xs: 12, md: 2.8 },
                  },
                ]}
              />
            </Stack>
            {!isBranchSaved ? (
              <Grid
                container
                sx={{
                  justifyContent: "center",
                  padding: 5,
                }}
                spacing={2}
              >
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button type="button" variant="outlined" color="primary">
                    Save & Close
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    onClick={handleAddBranch}
                    color="primary"
                  >
                    Save & Add Branch
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Divider
                sx={{
                  marginBottom: 4,
                }}
              />
            )}
          </Form>
        </Formik>
      </Paper>
    </Box>
  );
};

export default AddRestaurantForm;
