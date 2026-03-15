// components/reports/PageHeader.tsx
import React from "react";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { NavigateNext, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  backPath = "/reports",
}) => {
  const navigate = useNavigate();

  return (
    <Box mb={3}>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 1 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate(backPath)}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}>
          <ArrowBack fontSize="small" />
          Reports
        </Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>
    </Box>
  );
};
