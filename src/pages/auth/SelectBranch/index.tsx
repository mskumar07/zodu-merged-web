import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

import { useAppDispatch, useAppSelector } from "@store/store";
import { addUserData, AllCompanies } from "@store/slices/userSlice";
import { type Branch, type CompanyWithBranches } from "@pages/auth/Authapi";

const BRAND_RED = "#c8101f";
const CARD_BORDER = "rgba(19, 30, 56, 0.07)";
const CARD_BG = "rgba(255,255,255,0.82)";
const TEXT_PRIMARY = "#151822";
const TEXT_MUTED = "#8f93a3";

const getBranchIcon = (index: number) => {
  if (index % 3 === 0) return <StorefrontOutlinedIcon sx={{ fontSize: 17 }} />;
  if (index % 3 === 1) return <WarehouseOutlinedIcon sx={{ fontSize: 17 }} />;
  return <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />;
};

const getBranchAddress = (branch: Branch) => {
  const parts = [
    branch.branch_area_street_name,
    branch.branch_city,
    branch.branch_district,
    branch.branch_state,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Address not available";
};

function BranchRow({
  branch,
  index,
  onSelect,
}: {
  branch: Branch;
  index: number;
  onSelect: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: { xs: 1.5, md: 1.75 },
        py: 1.5,
        borderRadius: "5px",
        bgcolor: "#fff",
        border: "1px solid rgba(24,39,75,0.05)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            bgcolor: index === 0 ? "rgba(200,16,31,0.09)" : "#f3f1ef",
            color: index === 0 ? BRAND_RED : "#b2b0bb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {getBranchIcon(index)}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: TEXT_PRIMARY,
              lineHeight: 1.2,
            }}
          >
            {branch.branch_name}
          </Typography>
          <Typography
            sx={{
              mt: 0.2,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#c2a47f",
              lineHeight: 1.2,
            }}
          >
            {branch.branch_id || "Branch"}
          </Typography>
          <Typography
            sx={{
              mt: 0.15,
              fontSize: 11,
              color: TEXT_MUTED,
              lineHeight: 1.35,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: 120, sm: 160, md: 170 },
            }}
          >
            {getBranchAddress(branch)}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={onSelect}
        sx={{
          minWidth: 104,
          px: 1.5,
          py: 0.9,
          borderRadius: "8px",
          bgcolor: BRAND_RED,
          color: "#fff",
          boxShadow: "0 8px 18px rgba(200,16,31,0.2)",
          textTransform: "none",
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "#a80d19" },
        }}
      >
        Select & Continue
      </Button>
    </Box>
  );
}

function SupportRow() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.1,
        px: { xs: 1.5, md: 1.75 },
        py: 1.35,
        borderRadius: "14px",
        border: "1px solid rgba(24,39,75,0.06)",
        bgcolor: "rgba(255,255,255,0.76)",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "999px",
          bgcolor: "rgba(200,16,31,0.09)",
          color: BRAND_RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <SupportAgentOutlinedIcon sx={{ fontSize: 15 }} />
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 9.5,
            fontWeight: 800,
            lineHeight: 1.15,
            color: TEXT_PRIMARY,
            textTransform: "uppercase",
          }}
        >
          Setup New Branch?
        </Typography>
        <Typography
          sx={{
            mt: 0.15,
            fontSize: 10,
            fontWeight: 700,
            color: BRAND_RED,
            lineHeight: 1.2,
          }}
        >
          Contact Zodu Support
        </Typography>
      </Box>
    </Box>
  );
}

function CompanyCard({
  company,
  onSelectBranch,
}: {
  company: CompanyWithBranches;
  onSelectBranch: (branchId: string, branchName: string) => void;
}) {
  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: "1px solid",
        borderColor: CARD_BORDER,
        bgcolor: CARD_BG,
        backdropFilter: "blur(14px)",
        boxShadow: "0 18px 40px rgba(17, 24, 39, 0.06)",
        p: { xs: 1.75, md: 1.9 },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 23,
              fontWeight: 900,
              color: TEXT_PRIMARY,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {company.restaurant_name}
          </Typography>
          <Typography
            sx={{
              mt: 0.7,
              fontSize: 11.5,
              color: TEXT_MUTED,
              lineHeight: 1.45,
              maxWidth: 280,
            }}
          >
            {company.gst_no
              ? `GSTIN ${company.gst_no}`
              : "Main retail distribution network for lifestyle products."}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: 8.5,
              fontWeight: 800,
              color: "#b7bcc7",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Zodu ID
          </Typography>
          <Typography
            sx={{
              mt: 0.4,
              fontSize: 10.5,
              fontWeight: 800,
              color: "#78664f",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            {company.zodu_id}
          </Typography>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: 1,
              bgcolor: "#f6f3f1",
              border: "1px solid #efebe7",
              mt: 2,
              ml: "auto",
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 1.8, borderColor: "rgba(23,31,56,0.05)" }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
        {company.branches.map((branch, index) => (
          <BranchRow
            key={branch.branch_id}
            branch={branch}
            index={index}
            onSelect={() => onSelectBranch(branch.branch_id, branch.branch_name)}
          />
        ))}

        <SupportRow />
      </Box>
    </Box>
  );
}

const SelectBranch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const storedCompanies = useAppSelector(AllCompanies);

  const companiesFromState: CompanyWithBranches[] = useMemo(
    () => (location.state as { companies?: CompanyWithBranches[] } | null)?.companies ?? [],
    [location.state]
  );

  const companies: CompanyWithBranches[] = useMemo(
    () => (companiesFromState.length > 0 ? companiesFromState : storedCompanies),
    [companiesFromState, storedCompanies]
  );

  const handleSelectBranch = (
    company: CompanyWithBranches,
    branchId: string,
    branchName: string
  ) => {
    dispatch(addUserData({ branchId, branchName, zoduId: company.zodu_id }));
    navigate("/dashboard", { replace: true });
  };

  useEffect(() => {
    if (companies.length !== 1) return;
    const onlyCompany = companies[0];
    const branches = onlyCompany?.branches ?? [];
    if (branches.length !== 1) return;
    const onlyBranch = branches[0];
    dispatch(
      addUserData({
        zoduId: onlyCompany.zodu_id,
        branchId: onlyBranch.branch_id,
        branchName: onlyBranch.branch_name,
      })
    );
    navigate("/dashboard", { replace: true });
  }, [companies, dispatch, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
      
        display: "flex",

        flexDirection:"column",
        
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
              <Typography sx={{fontSize:20,fontWeight:600,mb:2}}>Select the Organization</Typography>

      <Box
        sx={{
          width: "100%",
          maxWidth: 1240,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: companies.length === 1 ? "minmax(320px, 560px)" : "repeat(2, minmax(0, 1fr))",
          },
          justifyContent: "center",
          gap: { xs: 2, md: 2.25 },
        }}
      >
        {companies.map((company) => (
          <CompanyCard
            key={company.zodu_id}
            company={company}
            onSelectBranch={(branchId, branchName) =>
              handleSelectBranch(company, branchId, branchName)
            }
          />
        ))}

        {companies.length === 0 && (
          <Box
            sx={{
              mx: "auto",
              width: "100%",
              maxWidth: 580,
              borderRadius: "20px",
              border: "1px solid rgba(19, 30, 56, 0.08)",
              bgcolor: "rgba(255,255,255,0.8)",
              boxShadow: "0 20px 44px rgba(17,24,39,0.06)",
              px: 4,
              py: 6,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: "16px",
                bgcolor: "rgba(200,16,31,0.08)",
                color: BRAND_RED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <BusinessOutlinedIcon />
            </Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: TEXT_PRIMARY }}>
              No companies available
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 14, color: TEXT_MUTED }}>
              Your account does not have an assigned company or branch yet.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SelectBranch;
