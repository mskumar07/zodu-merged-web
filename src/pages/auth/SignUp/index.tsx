import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Button from "@components/Button/index.tsx";
import Logo from "@components/Common/Logo/index.tsx";
import FormikTextInput from "@components/FormikTextInput/index.tsx";

import styles from "../SignIn/index.module.css";

// ✅ Yup Validation Schema
const SignUpSchema = Yup.object().shape({
  restaurantName: Yup.string().required("Restaurant name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const SignUp = () => {
  return (
    <Box className={styles.heroSection}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          <Logo fontSize="4rem" />
        </Typography>
        <Typography variant="body1" gutterBottom>
          Sign up to get started with your restaurant!
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Formik
          initialValues={{
            restaurantName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={SignUpSchema}
          onSubmit={(values) => {
            console.log("Form values", values);
          }}
        >
          {() => (
            <Form>
              <Box>
                {/* ✅ Restaurant Name */}
                <FormikTextInput
                  name="restaurantName"
                  label="Restaurant Name"
                  placeholder="Restaurant name"
                  sx={inputStyles}
                />

                {/* ✅ Email */}
                <FormikTextInput
                  name="email"
                  label="Email Id"
                  placeholder="Email ID"
                  sx={inputStyles}
                />

                {/* ✅ Phone Number */}
                <FormikTextInput
                  name="phone"
                  label="Phone"
                  placeholder="Phone number"
                  sx={inputStyles}
                />

                {/* ✅ Password */}
                <FormikTextInput
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Create password"
                  sx={inputStyles}
                />

                {/* ✅ Confirm Password */}
                <FormikTextInput
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  sx={inputStyles}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth={true}
                  sx={{
                    margin: "10px",
                    width: "92%",
                    padding: "10px 16px",
                    ":hover": {
                      backgroundColor: "#CA0023",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

// ✅ Common input styles
const inputStyles = {
  backgroundColor: "#f8f8f8",
  borderRadius: "8px",
  marginTop: "10px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#c4c4c4 !important",
    borderWidth: "1px !important",
  },
};

export default SignUp;
