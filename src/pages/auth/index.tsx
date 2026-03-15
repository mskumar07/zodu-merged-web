import styles from "./index.module.css";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

const Auth = () => {
  return (
    <Box className={styles.container}>
      {/* <Box className={styles.left}>
        <Typography variant="h4" fontWeight="bold" color="white">
          zodu
        </Typography>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="white">
            All-in-One Panel –<br />
            The Secret Recipe to
            <br />
            Running Your Restaurant
            <br />
            Right!
          </Typography>
        </Box>
        <Typography variant="caption" color="white">
          © 2025 Zodu, Inc. All Rights Reserved
        </Typography>
      </Box> */}
      <Box
        className={styles.left}
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "25px 33px",
          gap: "38vh",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="800"
          color="white"
          sx={{ mb: 2, fontSize: "2.5rem", letterSpacing: "0.05em" }}
        >
          zodu
        </Typography>

        <Box sx={{ mb: 0 }}>
          <Typography
            variant="h3"
            fontWeight="800"
            color="white"
            mt={5}
            mb={4}
            sx={{ lineHeight: 1.15 }}
          >
            All-in-One Panel –<br />
            The Secret Recipe to
            <br />
            Running Your Restaurant
            <br />
            Right!
          </Typography>

          <Typography
            variant="caption"
            color="white"
            sx={{ alignSelf: "flex-start", opacity: 0.8 }}
          >
            © 2025 Zodu, Inc. All Rights Reserved
          </Typography>
        </Box>
      </Box>

      <Box className={styles.right}>
        {/* <SignIn /> */}
        <SignUp />
      </Box>
    </Box>
  );
};

export default Auth;
