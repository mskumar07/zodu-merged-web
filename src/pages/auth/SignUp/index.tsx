import React from "react";
import { Formik, Form, Field, type FieldProps } from "formik";
import * as Yup from "yup";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import Logo from "@components/Common/Logo/index.tsx";
import { useSignupMutation } from "@pages/auth/Authapi";

const SignUpSchema = Yup.object().shape({
  restaurantName: Yup.string().required("Restaurant name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,30}$/,
      "Password must be 8–30 characters and include uppercase, lowercase, a number, and a special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const fieldSx = {
  mb: 2.25,
  "& .MuiInputLabel-root": {
    position: "static",
    transform: "none",
    color: "#111827",
    fontSize: "0.85rem",
    fontWeight: 600,
    mb: 0.8,
  },
  "& .MuiOutlinedInput-root": {
    height: 40,
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    fontSize: "0.95rem",
    color: "#111827",
    "& fieldset": {
      borderColor: "#9AA9BF",
    },
    "&:hover fieldset": {
      borderColor: "#6F829A",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#D6001C",
      borderWidth: 1,
    },
  },
  "& .MuiOutlinedInput-input": {
    px: 1.8,
    py: 1.25,
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "#A0AEC0",
    opacity: 1,
  },
  "& .MuiFormHelperText-root": {
    mx: 0,
    mt: 0.6,
  },
} as const;

const renderField = (
  name: string,
  label: string,
  placeholder: string,
  type = "text",
  startAdornment?: React.ReactNode
) => (
  <Field name={name}>
    {({ field, meta }: FieldProps) => (
      <TextField
        {...field}
        fullWidth
        type={type}
        label={label}
        placeholder={placeholder}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        error={Boolean(meta.touched && meta.error)}
        helperText={meta.touched && meta.error ? meta.error : " "}
        sx={fieldSx}
        InputProps={
          startAdornment
            ? {
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{
                      color: "#1F2937",
                      "& .MuiTypography-root": {
                        fontSize: "0.95rem",
                      },
                    }}
                  >
                    {startAdornment}
                  </InputAdornment>
                ),
              }
            : undefined
        }
      />
    )}
  </Field>
);

const SignUp = () => {
  const { mutate: signup } = useSignupMutation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: { xs: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 356,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "100%", textAlign: "center", mb: 4.5 }}>
          <Logo fontSize="1.8rem" />
          <Typography
            sx={{
              mt: 2.2,
              color: "#14050A",
              fontSize: "1.05rem",
              fontWeight: 700,
            }}
          >
            Create Account
          </Typography>
          <Typography
            sx={{
              mt: 1.6,
              color: "#64748B",
              fontSize: "0.84rem",
              fontWeight: 500,
              lineHeight: 1.45,
            }}
          >
            Welcome to the kitchen! Let&apos;s cook up something amazing together
          </Typography>
        </Box>

        <Formik
          initialValues={{
            restaurantName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            same_for_branch: false,
          }}
          validationSchema={SignUpSchema}
          onSubmit={(values) => {
            signup({
              restaurant_name: values.restaurantName,
              email: values.email,
              phone_number: values.phone,
              password: values.password,
              same_for_branch: values.same_for_branch,
            });
          }}
        >
          {() => (
            <Form style={{ width: "100%" }}>
              {renderField("restaurantName", "Restaurant Name", "Eg : Placeholder")}
              {renderField("email", "Email Id", "Eg : Placeholder")}
              {renderField("phone", "Mobile No", "Eg : Placeholder", "text", "+91")}
              {renderField("password", "Create Password", "Eg : Placeholder", "password")}
              {renderField(
                "confirmPassword",
                "Confirm Password",
                "Eg : Placeholder",
                "password"
              )}

              <Field name="same_for_branch">
                {({ field }: FieldProps) => (
                  <FormControlLabel
                    sx={{ mb: 1.5, ml: 0 }}
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        size="small"
                        sx={{
                          color: "#9AA9BF",
                          "&.Mui-checked": { color: "#D30020" },
                          p: 0,
                          mr: 1,
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.84rem", color: "#374151", fontWeight: 500 }}>
                        Same for branch
                      </Typography>
                    }
                  />
                )}
              </Field>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 0.25,
                  height: 39,
                  borderRadius: "9px",
                  backgroundColor: "#D30020",
                  boxShadow: "none",
                  fontSize: "0.98rem",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#B5001B",
                    boxShadow: "none",
                  },
                }}
              >
                Create Account
              </Button>

              <Typography
                sx={{
                  mt: 2,
                  textAlign: "center",
                  color: "#64748B",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                }}
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  underline="always"
                  sx={{
                    color: "#D30020",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    textUnderlineOffset: "2px",
                  }}
                >
                  Login here
                </Link>
              </Typography>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default SignUp;
