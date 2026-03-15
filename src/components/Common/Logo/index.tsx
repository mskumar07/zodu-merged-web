import Typography from "@mui/material/Typography";
import styles from "./index.module.css";

const LOGO_TEXT: string = "zodu";

// Now accepts a fontSize prop, with a default value of "2.5rem"
function Logo({ fontSize = "2.5rem", justifyContent = "center" }) {
  return (
    <Typography
      variant="logo"
      className={styles.gradientText}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: justifyContent,
        width: "100%",
        fontSize: fontSize,
        fontWeight: "800",
        letterSpacing: "0.05em",
      }}
    >
      {LOGO_TEXT}
    </Typography>
  );
}

export default Logo;
