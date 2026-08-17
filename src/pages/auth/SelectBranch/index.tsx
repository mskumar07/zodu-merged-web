import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAppDispatch, useAppSelector } from "@store/store";
import { addUserData, AllCompanies, UserProfile, setRoleAccess, setInvoiceSettings } from "@store/slices/userSlice";
import { authApis, type Branch, type CompanyWithBranches } from "@pages/auth/Authapi";
import SubscriptionExpiredModal from "@components/Modals/SubscriptionExpiredModal";
import SuccessToast from "@components/Common/SuccessToast";
import zlogo from "../../../assets/zlogo.png";

// Parses "16 Apr 2031" style dates; returns null if unparseable so callers
// can treat missing/garbled expiry as "not expired" rather than blocking access.
const parseExpiryDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSubscriptionExpired = (company: CompanyWithBranches): boolean => {
  const expiry = parseExpiryDate(company.subscription_expiry_date);
  if (!expiry) return false;
  const endOfExpiryDay = new Date(expiry);
  endOfExpiryDay.setHours(23, 59, 59, 999);
  return endOfExpiryDay.getTime() < Date.now();
};

const BRAND_RED = "#c8101f";
const CARD_BORDER = "rgba(19, 30, 56, 0.07)";
const CARD_BG = "rgba(255,255,255,0.82)";
const TEXT_PRIMARY = "#151822";
const TEXT_MUTED = "#8f93a3";

const getBranchAddress = (branch: Branch) => {
  const parts = [
    branch.address_line_1 || branch.branch_address_line_1 || branch.area_street_name || branch.branch_area_street_name,
    branch.address_line_2 || branch.branch_address_line_2,
    branch.city || branch.branch_city,
    branch.district || branch.branch_district,
    branch.state || branch.branch_state,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "";
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
          <LocationOnOutlinedIcon sx={{ fontSize: 17 }} />
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
            {branch.branch_id ? `${branch.branch_id} - ${branch.branch_name}` : branch.branch_name}
          </Typography>
          {getBranchAddress(branch) && (
            <Typography
              sx={{
                mt: 0.15,
                fontSize: 11,
                color: TEXT_MUTED,
                lineHeight: 1.35,
                whiteSpace: "normal",
                wordBreak: "break-word",
                maxWidth: { xs: 160, sm: 200, md: 210 },
              }}
            >
              {getBranchAddress(branch)}
            </Typography>
          )}
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={onSelect}
        endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
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
          "& .MuiButton-endIcon": { ml: 0.5 },
          "&:hover": { bgcolor: "#a80d19" },
        }}
      >
        Select & Continue
      </Button>
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
  const expired = useMemo(() => isSubscriptionExpired(company), [company]);

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              bgcolor: "rgba(200,16,31,0.09)",
              color: BRAND_RED,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <StorefrontOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              {company.restaurant_name || company.business_name || company.company_name || "Company Name"} - {company.business_type}
            </Typography>
            {company.gst_no && (
              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 11.5,
                  color: TEXT_MUTED,
                  lineHeight: 1.45,
                  maxWidth: 280,
                }}
              >
                {`GSTIN ${company.gst_no}`}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.6, flexShrink: 0 }}>
          <Box
            sx={{
              px: 1.1,
              py: 0.5,
              borderRadius: "999px",
              bgcolor: "#f6f3f1",
              border: "1px solid #efebe7",
              whiteSpace: "nowrap",
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                color: "#78664f",
              }}
            >
              {`Zodu ID - ${company.zodu_id}`}
            </Typography>
          </Box>
          {company.subscription_expiry_date && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.1,
                py: 0.4,
                borderRadius: "999px",
                bgcolor: expired ? "rgba(220,38,38,0.08)" : "rgba(37,99,235,0.08)",
                whiteSpace: "nowrap",
              }}
            >
              <ScheduleOutlinedIcon sx={{ fontSize: 12, color: expired ? "#dc2626" : "#2563eb" }} />
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: expired ? "#dc2626" : "#2563eb",
                }}
              >
                {expired ? "Expired" : `Exp: ${company.subscription_expiry_date}`}
              </Typography>
            </Box>
          )}
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
      </Box>
    </Box>
  );
}

const SelectBranch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const storedCompanies = useAppSelector(AllCompanies);
  const profile = useAppSelector(UserProfile);
  const loggedInName = profile?.employee_name || profile?.restaurant_name || "";

  const locationState = location.state as { companies?: CompanyWithBranches[]; fromSwitch?: boolean } | null;
  const fromSwitch = locationState?.fromSwitch ?? false;

  const companiesFromState: CompanyWithBranches[] = useMemo(
    () => locationState?.companies ?? [],
    [locationState]
  );

  const companies: CompanyWithBranches[] = useMemo(
    () => (companiesFromState.length > 0 ? companiesFromState : storedCompanies),
    [companiesFromState, storedCompanies]
  );

  const [expiredCompany, setExpiredCompany] = useState<CompanyWithBranches | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Permissions are scoped per zodu_id + branch_id and only resolvable once a
  // branch is chosen, so they're fetched here rather than carried on login.
  const loadRoleAccess = async (zoduId: string, branchId: string) => {
    try {
      const roleAccess = await authApis.getRoleAccess(zoduId, branchId);
      dispatch(setRoleAccess(roleAccess));
    } catch {
      dispatch(setRoleAccess([]));
    }
  };

  // Settings are scoped per zodu_id + branch_id too. A 400 here means the
  // user doesn't have access to this company's settings; stay on this page
  // so the error toast is visible instead of navigating away immediately.
  const loadSettings = async (zoduId: string, branchId: string): Promise<boolean> => {
    try {
      const res = await authApis.getSettings(zoduId, branchId);
      dispatch(setInvoiceSettings(res.settings?.invoice ?? null));
      return true;
    } catch (err: any) {
      dispatch(setInvoiceSettings(null));
      setErrorMsg(err?.response?.data?.error || "Failed to load settings");
      return false;
    }
  };

  const handleSelectBranch = async (
    company: CompanyWithBranches,
    branchId: string,
    branchName: string
  ) => {
    if (isSubscriptionExpired(company)) {
      setExpiredCompany(company);
      return;
    }
    dispatch(addUserData({ branchId, branchName, zoduId: company.zodu_id, businessType: company.business_type ?? "" }));
    await loadRoleAccess(company.zodu_id, branchId);
    const settingsOk = await loadSettings(company.zodu_id, branchId);
    if (!settingsOk) return;
    navigate("/dashboard", { replace: true });
  };

  useEffect(() => {
    if (fromSwitch) return;
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
        businessType: onlyCompany.business_type ?? "",
      })
    );
    loadRoleAccess(onlyCompany.zodu_id, onlyBranch.branch_id).then(async () => {
      const settingsOk = await loadSettings(onlyCompany.zodu_id, onlyBranch.branch_id);
      if (settingsOk) navigate("/dashboard", { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, dispatch, navigate, fromSwitch]);

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        overflowY: "auto",
        bgcolor: "#fff",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Box
        component="img"
        src={zlogo}
        alt="Zodu"
        sx={{
          position: "absolute",
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 32 },
          height: 32,
          width: "auto",
          objectFit: "contain",
        }}
      />

      {loggedInName && (
        <Box
          sx={{
            position: "absolute",
            top: { xs: 16, md: 24 },
            right: { xs: 16, md: 32 },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: BRAND_RED,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {loggedInName.trim().charAt(0).toUpperCase()}
          </Avatar>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY }}>
            {loggedInName}
          </Typography>
        </Box>
      )}

              <Typography sx={{fontSize:20,fontWeight:600,mb:2}}>Select Your Business</Typography>

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

      <SubscriptionExpiredModal
        open={expiredCompany !== null}
        businessName={
          expiredCompany?.restaurant_name ||
          expiredCompany?.business_name ||
          expiredCompany?.company_name ||
          ""
        }
        expiryDate={expiredCompany?.subscription_expiry_date}
        onClose={() => setExpiredCompany(null)}
      />

      <SuccessToast
        message={errorMsg || ""}
        severity="error"
        onClose={() => setErrorMsg(null)}
      />
    </Box>
  );
};

export default SelectBranch;
