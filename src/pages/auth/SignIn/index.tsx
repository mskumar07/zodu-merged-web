// import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Button from "@components/Button/index.tsx";
// import Logo from "@components/Common/Logo/index.tsx";
// import TextInput from "@components/TextInput/index.tsx";
// import FormikTextInput from "@components/FormikTextInput/index.tsx";
// import styles from "./index.module.css";

// const SignIn = () => {
//   return (
//     <>
//       <Box className={styles.heroSection}>
//         <Box sx={{ textAlign: "center" }}>
//           <Typography variant="h4" fontWeight="bold" color="primary">
//             <Logo fontSize="4rem" />
//           </Typography>
//           <Typography variant="body1" gutterBottom>
//             Great to have you back in the kitchen!
//           </Typography>
//         </Box>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Box>
//             <TextInput
//               placeholder="Email or phone number"
//               label=""
//               name="email"
//               sx={{
//                 backgroundColor: "#f8f8f8",
//                 borderRadius: "8px",
//                 "& .MuiOutlinedInput-notchedOutline": {
//                   borderColor: "#c4c4c4 !important",
//                   borderWidth: "1px !important",
//                 },
//               }}
//             />
//             <TextInput
//               placeholder="Enter password"
//               type="password"
//               label=""
//               name="password"
//               sx={{
//                 backgroundColor: "#f8f8f8",
//                 borderRadius: "8px",
//                 "& .MuiOutlinedInput-notchedOutline": {
//                   borderColor: "#c4c4c4 !important",
//                   borderWidth: "1px !important",
//                 },
//               }}
//             />

//             <Typography mt={2} variant="body2" textAlign="right">
//               Forgot password?
//             </Typography>
//             <Button
//               type="submit"
//               fullWidth={true}
//               sx={{
//                 margin: "10px",
//                 width: "98%",
//                 ":hover": {
//                   backgroundColor: "#CA0023", // matches the normal state
//                 },
//               }}
//             >
//               Sign Up
//             </Button>
//           </Box>
//         </Box>
//       </Box>
//     </>
//   );
// };

// export default SignIn;

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Button from "@components/Button/index.tsx";
import Logo from "@components/Common/Logo/index.tsx";
import FormikTextInput from "@components/FormikTextInput/index.tsx";

import styles from "./index.module.css";

// ✅ Yup Validation Schema
const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email or phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const SignIn = () => {
  return (
    <Box className={styles.heroSection}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          <Logo fontSize="4rem" />
        </Typography>
        <Typography variant="body1" gutterBottom>
          Great to have you back in the kitchen!
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
            email: "",
            password: "",
          }}
          validationSchema={SignInSchema}
          onSubmit={(values) => {
            console.log("Form values", values);
          }}
        >
          {() => (
            <Form>
              <Box>
                {/* ✅ Email */}
                <FormikTextInput
                  name="email"
                  label="Email"
                  placeholder="Email or phone number"
                  sx={{
                    backgroundColor: "#f8f8f8",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#c4c4c4 !important",
                      borderWidth: "1px !important",
                    },
                  }}
                />

                {/* ✅ Password */}
                <FormikTextInput
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  sx={{
                    backgroundColor: "#f8f8f8",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#c4c4c4 !important",
                      borderWidth: "1px !important",
                    },
                  }}
                />

                {/* Forgot Password */}
                <Typography mt={2} variant="body2" textAlign="right">
                  Forgot password?
                </Typography>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth={true}
                  sx={{
                    margin: "10px",
                    width: "95%",
                    ":hover": {
                      backgroundColor: "#CA0023",
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default SignIn;
