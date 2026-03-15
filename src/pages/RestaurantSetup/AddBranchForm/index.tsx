import Button from "@components/Button/index.tsx"; // Use MUI's Button
import FormikSectionGrid from "@components/FormikSectionGrid/index.tsx";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import OpeningHoursNew from "./OpeningHoursNew/index.tsx";
// import { defaultSlot } from "./OpeningHoursFieldArray/index.tsx";
import styles from "./index.module.css";
import type { addForm } from "./type.ts";

// const weekDays = [
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
//   "Sunday",
// ];

// const generateInitialOpeningHours = (): OpeningHours =>
//   Object.fromEntries(weekDays.map((day) => [day, [{ ...defaultSlot }]]));

const validationSchema = Yup.object({
  branchName: Yup.string().required("Required"),
  branchManager: Yup.string().required("Required"),
  branchMobile: Yup.string().required("Required"),
  bracnhMailId: Yup.string().email("Invalid email").required("Required"),
  fssai: Yup.string().required("Required"),
  gst: Yup.string(),
  addressLine1: Yup.string(),
  addressLine2: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  district: Yup.string(),
  pincode: Yup.string(),
  accountNumber: Yup.string(),
  accountType: Yup.string(),
  ifscCode: Yup.string(),

  // openingHours: Yup.object().test(
  //   "slot-times-present",
  //   "Please provide both open and close times for all slots",
  //   (value) =>
  //     !!value &&
  //     weekDays.every(
  //       (day) =>
  //         Array.isArray((value as OpeningHours)[day]) &&
  //         (value as OpeningHours)[day].every(
  //           (slot) => !!slot.open && !!slot.close
  //         )
  //     )
  // ),
});

const initialValues = {
  restaurantName: "",
  mobile: "",
  email: "",
  ownerName: "",
  gst: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  accountNumber: "",
  accountType: "",
  ifscCode: "",
  openingHours: [],
  // openingHours: generateInitialOpeningHours(),
};


const AddBranchForm: React.FC<addForm> = ({ onSubmit }) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          marginTop: "1%",
          marginBottom: "2%",
        }}
        color="textPrimary"
      >
        Branch Details
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
            alert(JSON.stringify(values, null, 2));
            onSubmit();
          }}
        >
          {() => (
            <Form className={styles.form}>
              <FormikSectionGrid
                title="Basic Details"
                minHeight="130px" // Passing minHeight prop if your component supports it
                padding={2}
                fields={[
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  }, // Spacer at row start
                  {
                    name: "branchName",
                    label: "Branch Name",
                    isRequired: true,
                    placeholder: "PAVITHRAM FOODS",
                    size: { xs: 12, md: 2.8 }, // Use 3 as per your original grid
                  },
                  {
                    name: "branchAdmin",
                    label: "Branch Manager/Admin",
                    isRequired: true,
                    placeholder: "PAVITHRAM FOODS",
                    size: { xs: 12, md: 2.9 },
                  },
                  {
                    name: "branchMobileNumber",
                    label: "Branch Mobile No",
                    isRequired: true,
                    placeholder: "PAVITHRAM FOODS",
                    size: { xs: 12, md: 2.9 },
                  },
                  {
                    name: "branchMailId",
                    label: "Branch Mail Id",
                    isRequired: true,
                    placeholder: "PAVITHRAM FOODS",
                    size: { xs: 12, md: 2.9 },
                  },
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  },
                  {
                    name: "fssai",
                    label: "FSSAI",
                    isRequired: true,
                    placeholder: "PAVITHRAM FOODS",
                    size: { xs: 12, md: 2.9 }, // This field is extra beyond 12 columns—consider wrapping or resizing as needed
                  },
                ]}
              />

              <FormikSectionGrid
                title="Address Details"
                minHeight="150px"
                padding={2}
                fields={[
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  }, // Spacer at row start
                  {
                    name: "",
                    fieldType: "checkbox",
                    label: "Same as Restaurant's address details",
                    size: { xs: 12, md: 11.5 },
                  },
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  }, // Spacer at row start
                  {
                    name: "pincode",
                    label: "Pincode",
                    isRequired: true,
                    placeholder: "Eg: Placeholder",
                    size: { xs: 12, md: 2.8 }, // updated from 3 to 2.8
                  },
                  {
                    name: "city",
                    label: "City",
                    isRequired: true,
                    placeholder: "Eg: City",
                    size: { xs: 12, md: 2.9 }, // remains 2.9
                    isDisabled: true,
                  },
                  {
                    name: "district",
                    label: "District",
                    isRequired: true,
                    placeholder: "Eg: City",
                    size: { xs: 12, md: 2.9 }, // remains 2.9
                    isDisabled: true,
                  },
                  {
                    name: "state",
                    label: "State",
                    isRequired: true,
                    placeholder: "Eg: City",
                    size: { xs: 12, md: 2.9 }, // remains 2.9
                    isDisabled: true,
                  },
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  }, // Spacer at row start
                  {
                    name: "addressLine1",
                    label: "Floor / Building No / Flat No",
                    placeholder: "#22, SRI SAI BABA NAGAR,",
                    size: { xs: 12, md: 5.7 }, // updated from 6 to 5.7
                  },
                  {
                    name: "addressLine2",
                    label: "Area / Street Name",
                    placeholder: "KUWAIT MAIN STREET, SAL...",
                    size: { xs: 12, md: 5.8 }, // updated from 6 to 5.9
                  },
                ]}
              />

              <FormikSectionGrid
                title="Bank Details"
                minHeight="130px"
                padding={2}
                fields={[
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  }, // Spacer at row start
                  {
                    name: "",
                    fieldType: "checkbox",
                    label: "Same as Restaurant's Bank details",
                    size: { xs: 12, md: 11.5 },
                  },
                  {
                    isSpacer: true,
                    name: "",
                    label: "",
                    size: { xs: 12, md: 0.5 },
                  }, // Spacer at row start
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

              <OpeningHoursNew />

              <Grid
                container
                sx={{
                  justifyContent: "center",
                  paddingBottom: "3%",
                }}
                spacing={2}
              >
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button type="button" variant="outlined" color="primary">
                    Clear
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                    type="submit"
                    onClick={onSubmit}
                    variant="contained"
                    color="primary"
                  >
                    Save & Add Branch
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default AddBranchForm;
