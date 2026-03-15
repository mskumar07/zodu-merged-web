import React, { useState } from "react";
import {
  Grid,
  Paper,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextViewOrField from "../TextViewOrField";
import Group from "../../../assets/icons/MenuIcons/Group.svg";
import Edit from "../../../assets/icons/MenuIcons/edit.svg";

// Dummy Data (Replace with actual API data)
const initialValues = {
  ownerName: "Darrell Steward",
  mobile: "+91 9876453672",
  email: "xyz@gmail.com",
  gstNo: "63729836483",
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
  ownerName: Yup.string().required("Required"),
  mobile: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  gstNo: Yup.string().required("Required"),
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

const RestaurantDetailsPage: React.FC = () => {
  const [editable, setEditable] = useState(false);

 

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          marginBottom: 2,
        }}
      >
        <Typography variant="h5">Restaurant Details</Typography>
        <IconButton onClick={() => setEditable(!editable)}>
          <img src={Edit} />
        </IconButton>
      </Stack>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          backgorundColor: "#FAFAFA",
          border: "1px solid #f0f0f0",
        }}
      >
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
        <Grid container>
          <Grid size={{ xs: 12, md: 0.5 }}></Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" gutterBottom>
              Restaurant / Company Name
            </Typography>
          </Grid>
        </Grid>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            setEditable(false);
          }}
          enableReinitialize
        >
          {() => (
            <Form style={{ width: "100%" }}>
              <Grid container spacing={3}>
                {/* Basic Details */}
                <Grid size={{ md: 12 }}>
                  <Typography>Basic Details</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 0.2 }}></Grid>
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <TextViewOrField
                    name="ownerName"
                    label="Owner / Admin Name"
                    value={initialValues.ownerName}
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
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <TextViewOrField
                    name="email"
                    label="Mail ID"
                    value={initialValues.email}
                    editable={editable}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <TextViewOrField
                    name="gstNo"
                    label="GST No"
                    value={initialValues.gstNo}
                    editable={editable}
                  />
                </Grid>

                {/* Address Details */}
                <Grid size={{ md: 12 }}>
                  <Typography>Address Details</Typography>
                </Grid>
                {editable ? (
                  <>
                    <Grid size={{ xs: 12, md: 0.2 }}></Grid>
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
                    <Grid size={{ xs: 12, md: 0.27 }}></Grid>
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
                {/* Bank Details */}
                <Grid size={{ md: 12 }}>
                  <Typography>Bank Details</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 0.2 }}></Grid>
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <TextViewOrField
                    name="accountNumber"
                    label="Account Number"
                    value={initialValues.accountNumber}
                    editable={editable}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <TextViewOrField
                    name="accountType"
                    label="Account Type"
                    value={initialValues.accountType}
                    editable={editable}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <TextViewOrField
                    name="ifsc"
                    label="IFSC Code"
                    value={initialValues.ifsc}
                    editable={editable}
                  />
                </Grid>
              </Grid>
              <Grid
                container
                spacing={5}
                justifyContent="center"
                alignItems="center"
                padding={3}
              >
                {editable && (
                  <>
                    <Grid
                      size={{ xs: 12, md: 6 }}
                      display="flex"
                      justifyContent="flex-end"
                    >
                      <Button type="submit" variant="outlined" color="primary">
                        Save & Close
                      </Button>
                    </Grid>
                    <Grid
                      size={{ xs: 12, md: 6 }}
                      display="flex"
                      justifyContent="flex-start"
                    >
                      <Button type="submit" variant="contained" color="primary">
                        Save & Add Branch
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default RestaurantDetailsPage;
