import React, { useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  IconButton,
  Switch,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextViewOrField from "../TextViewOrField";
import OpeningHoursNew from "../AddBranchForm/OpeningHoursNew";

// Sample data, replace with your props/data
const initialValues = {
  branchName: "Chennai - Adyar",
  manager: "Darrell Steward",
  mobile: "+91 9876453672",
  email: "xyz@gmail.com",
  fssai: "1241124842264822428",
  address:
    "House No. 57, Sector 21A, Near Tau Devi Lal Park, Faridabad, Haryana - 121001",
  accountNumber: "455455864983",
  accountType: "Current Account",
  ifsc: "HDFC738369K",
  addressline2: "",
  addressline1: "",
  district: "",
  state: "",
  city: "",
  pincode: "",
};

const validationSchema = Yup.object({
  branchName: Yup.string().required("Required"),
  manager: Yup.string().required("Required"),
  mobile: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  fssai: Yup.string().required("Required"),
  address: Yup.string().required("Required"),
  accountNumber: Yup.string().required("Required"),
  accountType: Yup.string().required("Required"),
  ifsc: Yup.string().required("Required"),
  addressline2: Yup.string(),
  addressline1: Yup.string(),
  district: Yup.string(),
  state: Yup.string(),
  city: Yup.string(),
  pincode: Yup.string(),
});

const BranchDetails: React.FC = () => {
  const [editable, setEditable] = useState(false);
  const [toggle, setToggle] = useState(false); // For top-right toggle

  // Handler for toggle switch
  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setToggle(event.target.checked);

  return (
    <Box>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3}>
          {/* Header Row: Branch ID, Avatar, Toggle, Edit Icon */}
          <Grid
            size={{ xs: 12, md: 12 }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box sx={{ flexGrow: 1 }} />
            <Switch
              checked={toggle}
              onChange={handleToggleChange}
              sx={{ mr: 2 }}
            />
            <IconButton onClick={() => setEditable((edit) => !edit)}>
              <EditIcon color={editable ? "primary" : "action"} />
            </IconButton>
          </Grid>

          {/* Basic Details */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={() => setEditable(false)}
          >
            {() => (
              <Form style={{ width: "100%" }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      ml={1}
                      padding={2}
                    >
                      Basic Details
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 0.5 }}></Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextViewOrField
                      name="branchName"
                      label="Branch Name"
                      value={initialValues.branchName}
                      editable={editable}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextViewOrField
                      name="manager"
                      label="Branch Manager / Admin"
                      value={initialValues.manager}
                      editable={editable}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2.5 }}>
                    <TextViewOrField
                      name="mobile"
                      label="Mobile No"
                      value={initialValues.mobile}
                      editable={editable}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextViewOrField
                      name="email"
                      label="Mail ID"
                      value={initialValues.email}
                      editable={editable}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 0.5 }}></Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextViewOrField
                      name="fssai"
                      label="FSSAI"
                      value={initialValues.fssai}
                      editable={editable}
                    />
                  </Grid>
                </Grid>

                {/* Address Details */}
                <Grid container spacing={3}>
                  <Grid size={{ md: 12 }}>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      ml={1}
                      padding={2}
                    >
                      Address Details
                    </Typography>
                  </Grid>
                  {editable ? (
                    <>
                      <Grid size={{ xs: 12, md: 0.5 }}></Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextViewOrField
                          name="pincode"
                          label="Pincode"
                          value={initialValues.pincode}
                          editable={editable}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextViewOrField
                          name="city"
                          label="Branch Manager / Admin"
                          value={initialValues.city}
                          editable={editable}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2.5 }}>
                        <TextViewOrField
                          name="state"
                          label="State"
                          value={initialValues.state}
                          editable={editable}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextViewOrField
                          name="district"
                          label="District"
                          value={initialValues.district}
                          editable={editable}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 0.5 }}></Grid>
                      <Grid size={{ xs: 12, md: 5.5 }}>
                        <TextViewOrField
                          name="addressline1"
                          label="Floor/Building no/Flat no"
                          value={initialValues.addressline1}
                          editable={editable}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 5.5 }}>
                        <TextViewOrField
                          name="addressline2"
                          label="Area/Street Name"
                          value={initialValues.addressline2}
                          editable={editable}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid size={{ xs: 12, md: 0.5 }}></Grid>
                      <Grid size={{ xs: 11 }}>
                        <TextViewOrField
                          name="address"
                          label="Address"
                          value={initialValues.address}
                          editable={editable}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                {/* Bank Details */}
                <Grid container>
                  <Grid size={{ md: 12 }}>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      ml={1}
                      padding={2}
                    >
                      Bank Details
                    </Typography>
                  </Grid>
                  <Grid size={{ md: 0.5 }}></Grid>
                  <Grid size={{ md: 3, xs: 12 }}>
                    <TextViewOrField
                      name="accountNumber"
                      label="Account Number"
                      value={initialValues.accountNumber}
                      editable={editable}
                    />
                  </Grid>
                  <Grid size={{ md: 3, xs: 12 }}>
                    <TextViewOrField
                      name="accountType"
                      label="Account Type"
                      value={initialValues.accountType}
                      editable={editable}
                    />
                  </Grid>
                  <Grid size={{ md: 3, xs: 12 }}>
                    <TextViewOrField
                      name="ifsc"
                      label="IFSC Code"
                      value={initialValues.ifsc}
                      editable={editable}
                    />
                  </Grid>
                </Grid>

                {/* Opening Hours */}
                <OpeningHoursNew />
              </Form>
            )}
          </Formik>
        </Grid>
      </Paper>
    </Box>
  );
};

export default BranchDetails;
