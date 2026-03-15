import React from "react";
import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  sx?: MuiButtonProps["sx"];
  size?: MuiButtonProps["size"];
  fullWidth?: boolean;
  variant?: MuiButtonProps["variant"];
  color?: MuiButtonProps["color"];
  startIcon?: MuiButtonProps["startIcon"];
  endIcon?: MuiButtonProps["endIcon"];
}

const Button = ({
  children,
  onClick,
  type = "button",
  sx,
  size,
  fullWidth = true,
  variant = "contained",
  color = "primary",
  startIcon,
  endIcon,
}: ButtonProps) => {
  return (
    <MuiButton
      fullWidth={fullWidth}
      variant={variant}
      color={color}
      onClick={onClick}
      type={type}
      size={size}
      startIcon={startIcon}
      disableElevation
      disableRipple
      endIcon={endIcon}
      sx={{ ...((sx as object) || {}) }}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
