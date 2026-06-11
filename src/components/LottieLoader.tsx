import Lottie from "lottie-react";
import { Box } from "@mui/material";
import loadingAnimation from "@assets/loading.json";

export default function LottieLoader() {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Lottie animationData={loadingAnimation} loop style={{ width: 120, height: 120 }} />
    </Box>
  );
}
