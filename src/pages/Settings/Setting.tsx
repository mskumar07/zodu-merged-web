import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DomainAddRoundedIcon from "@mui/icons-material/DomainAddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authApis,
  type Branch,
  type CreateBranchPayload,
  type CreateCompanyPayload,
  type EditBranchPayload,
  type EditCompanyPayload,
  type CompanyWithBranches,
} from "@pages/auth/Authapi";
import BranchFormModal, { type BranchFormData } from "./BranchFormModal";
import BusinessFormModal, { type BusinessFormData } from "./CompanyFormModal";
import { useAppDispatch } from "@store/store";
import { setCompanies } from "@store/slices/userSlice";

const pageBackground = "#f7f7fa";
const cardBorder = "#ececf2";
const subtleText = "#8e95a3";
const headingText = "#1d2533";
const redTint = "#ca0022";

type SettingsTab = "company" | "invoice" | "user";

const getCompanyAddressLine1 = (company?: CompanyWithBranches | null) => {
  if (!company) return "";
  const companyAny = company as CompanyWithBranches & {
    address_line_1?: string;
    business_name?: string;
  };
  return companyAny.address_line_1 || company.area_street_name || "";
};

const getCompanyAddressLine2 = (company?: CompanyWithBranches | null) => {
  if (!company) return "";
  const companyAny = company as CompanyWithBranches & { address_line_2?: string };
  return companyAny.address_line_2 || company.building_no || "";
};

const getBranchAddressLine1 = (branch?: Branch | null) => {
  if (!branch) return "";
  const branchAny = branch as Branch & { address_line_1?: string; area_street_name?: string };
  return (
    branch.branch_address_line_1 ||
    branchAny.address_line_1 ||
    branch.branch_area_street_name ||
    branchAny.area_street_name ||
    ""
  );
};

const getBranchAddressLine2 = (branch?: Branch | null) => {
  if (!branch) return "";
  const branchAny = branch as Branch & { address_line_2?: string; building_no?: string };
  return (
    branch.branch_address_line_2 ||
    branchAny.address_line_2 ||
    branch.branch_floor_building_no ||
    branchAny.building_no ||
    ""
  );
};

const getBranchCity = (branch?: Branch | null) => {
  if (!branch) return "";
  return branch.branch_city || branch.city || "";
};

const getBranchDistrict = (branch?: Branch | null) => {
  if (!branch) return "";
  return branch.branch_district || branch.district || "";
};

const getBranchState = (branch?: Branch | null) => {
  if (!branch) return "";
  return branch.branch_state || branch.state || "";
};

const getBranchPincode = (branch?: Branch | null) => {
  if (!branch) return "";
  return branch.branch_pincode || (branch as Branch & { pincode?: string }).pincode || "";
};

const getBranchManager = (branch?: Branch | null) => {
  if (!branch) return "";
  return branch.branch_manager_or_admin || branch.branch_manager || "";
};

const getBranchAccountNumber = (branch?: Branch | null) => {
  if (!branch) return "";
  return branch.branch_account_no || branch.account_number || "";
};

const getBranchAccountType = (branch?: Branch | null) => {
  if (!branch) return "";
  return branch.branch_account_type || branch.account_type || "";
};

const getBranchIfscCode = (branch?: Branch | null) => {
  if (!branch) return "";
  return branch.branch_ifsc || branch.ifsc_code || "";
};

const formatLocation = (branch?: Branch) => {
  if (!branch) return "Not available";

  const parts = [
    getBranchAddressLine1(branch),
    getBranchCity(branch),
    getBranchDistrict(branch),
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : getBranchState(branch) || "Not available";
};

const getCompanyIcon = (index: number) => {
  if (index % 3 === 0) return <BusinessRoundedIcon fontSize="small" />;
  if (index % 3 === 1) return <ApartmentRoundedIcon fontSize="small" />;
  return <StoreRoundedIcon fontSize="small" />;
};

export default function Setting() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<string[]>([]);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchCompanyId, setBranchCompanyId] = useState<string>("");
  const [editingCompany, setEditingCompany] = useState<CompanyWithBranches | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [viewingCompany, setViewingCompany] = useState<CompanyWithBranches | null>(null);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
// Find the company object when opening the branch modal
  const openAddBranch = (companyId: string) => {
    setEditingBranch(null);
    setBranchCompanyId(companyId);
    setBranchModalOpen(true);
  };
  
  const openEditBranch = (branch: Branch, companyId: string) => {
    setEditingBranch(branch);
    setBranchCompanyId(companyId);
    setBranchModalOpen(true);
  };
  
  const closeBranchModal = () => {
    setSubmitError(null);
    setBranchModalOpen(false);
    setEditingBranch(null);
  };
  
  const openAddCompany = () => {
    setEditingCompany(null);
    setCompanyModalOpen(true);
  };
  
  const openEditCompany = (company: CompanyWithBranches) => {
    console.log(company)
    setEditingCompany(company);
    setCompanyModalOpen(true);
  };
  
  const closeCompanyModal = () => {
    setSubmitError(null);
    setCompanyModalOpen(false);
    setEditingCompany(null);
  };

  const companiesQuery = useQuery({
    queryKey: ["settings", "companies"],
    queryFn: authApis.getMyCompanies,
  });

  const createCompanyMutation = useMutation({
    mutationFn: (payload: CreateCompanyPayload) => authApis.createCompany(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", "companies"] });
      closeCompanyModal();
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Unable to create company.");
    },
  });

  const companies = useMemo(
    () => companiesQuery.data ?? [],
    [companiesQuery.data]
  );

  useEffect(() => {
    if (companies.length > 0) dispatch(setCompanies(companies));
  }, [companies, dispatch]);

  useEffect(() => {
    if (companies.length > 0 && expandedCompanyIds.length === 0) {
      setExpandedCompanyIds(companies.map((company) => company.zodu_id));
    }
  }, [companies, expandedCompanyIds.length]);

  const createBranchMutation = useMutation({
    mutationFn: (payload: CreateBranchPayload) => authApis.createBranch(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["settings", "companies"] }),
      ]);
      closeBranchModal();
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Unable to create branch.");
    },
  });

  const editBranchMutation = useMutation({
    mutationFn: (params: { zoduId: string; branchId: string; payload: EditBranchPayload }) =>
      authApis.editBranch(params.zoduId, params.branchId, params.payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["settings", "companies"] }),
      ]);
      closeBranchModal();
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Unable to update branch.");
    },
  });

  const editCompanyMutation = useMutation({
    mutationFn: (params: { zoduId: string; payload: EditCompanyPayload }) => {
      console.log("=== editCompanyMutation.mutationFn called ===");
      console.log("params:", params);
      return authApis.editCompany(params.zoduId, params.payload);
    },
    onSuccess: async () => {
      console.log("✓ editCompanyMutation onSuccess - invalidating queries");
      await queryClient.invalidateQueries({ queryKey: ["settings", "companies"] });
      closeCompanyModal();
    },
    onError: (error: Error) => {
      console.error("✗ editCompanyMutation onError:", error);
      setSubmitError(error.message || "Unable to update company.");
    },
  });

  const toggleCompanyExpanded = (companyId: string) => {
    setExpandedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleBranchSubmit = async (data: BranchFormData, isEdit: boolean) => {
    setSubmitError(null);
    const zoduId = branchCompanyId;
    if (!zoduId) {
      setSubmitError("Company context is missing. Please refresh and try again.");
      return;
    }

    const selectedCompany = companies.find((c) => c.zodu_id === zoduId);
    const selectedCompanyAny = selectedCompany as
      | (typeof selectedCompany & {
          address_id?: string;
          addressId?: string;
          bank_details_id?: string;
          bankDetailsId?: string;
        })
      | undefined;

    const selectedAddressId =
      selectedCompanyAny?.address_id ?? selectedCompanyAny?.addressId ?? undefined;
    const selectedBankDetailsId =
      selectedCompanyAny?.bank_details_id ?? selectedCompanyAny?.bankDetailsId ?? undefined;
    const selectedAddressIdString =
      selectedAddressId !== undefined && selectedAddressId !== null
        ? String(selectedAddressId)
        : undefined;
    const selectedBankDetailsIdString =
      selectedBankDetailsId !== undefined && selectedBankDetailsId !== null
        ? String(selectedBankDetailsId)
        : undefined;

    if (data.use_same_address_as_company && !selectedAddressIdString) {
      setSubmitError("Selected company address id is missing. Please update company address first.");
      return;
    }

    if (data.use_same_bank_as_company && !selectedBankDetailsIdString) {
      setSubmitError("Selected company bank details id is missing. Please update company bank details first.");
      return;
    }

    const payload = {
      zodu_id: zoduId,
      branch_id: (isEdit && editingBranch?.branch_id) || data.branch_id || undefined,
      branch_name: data.branch_name,
      branch_manager_or_admin: data.branch_manager_or_admin,
      branch_mobile_no: data.branch_mobile_no,
      branch_mail_id: data.branch_mail_id,
      branch_city: data.branch_city,
      branch_pincode: data.branch_pincode,
      branch_district: data.branch_district,
      branch_state: data.branch_state,
      branch_image: data.branch_image || undefined,
      ...(data.use_same_address_as_company
        ? {
            address_id: selectedAddressIdString,
          }
        : {
            address_line_1:
              data.branch_address_line_1 || data.branch_area_street_name || undefined,
            address_line_2:
              data.branch_address_line_2 || data.branch_floor_building_no || undefined,
          }),
      ...(data.use_same_bank_as_company
        ? {
            bank_details_id: selectedBankDetailsIdString,
          }
        : {
            bank_name: data.bank_name || undefined,
            bank_branch: data.bank_branch || undefined,
            holder_name: data.holder_name || undefined,
            account_number: data.branch_account_no || undefined,
            account_type: data.branch_account_type || undefined,
            ifsc_code: data.branch_ifsc || undefined,
          }),
    };

    if (isEdit && editingBranch) {
      await editBranchMutation.mutateAsync({
        zoduId,
        branchId: editingBranch.branch_id,
        payload,
      });
    } else {
      await createBranchMutation.mutateAsync({
        ...payload,
      });
    }
  };

  const handleCompanySubmit = async (data: BusinessFormData, isEdit: boolean) => {
    console.log("=== handleCompanySubmit called ===");
    console.log("isEdit:", isEdit);
    console.log("editingCompany:", editingCompany);
    
    setSubmitError(null);
    
    const editPayload: EditCompanyPayload = {
      restaurant_name: data.restaurant_name,
      owner_admin_name: data.owner_admin_name,
      gst_no: data.gst_no,
      phone_number: data.phone_number,
      email: data.email,
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2,
      city: data.city,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      bank_name: data.bank_name,
      bank_branch: data.bank_branch,
      holder_name: data.holder_name,
      account_number: data.account_number,
      account_type: data.account_type,
      ifsc_code: data.ifsc_code,
    };

    console.log("editPayload:", editPayload);

    if (isEdit && editingCompany) {
      console.log("✓ Calling editCompanyMutation with zoduId:", editingCompany.zodu_id);
      await editCompanyMutation.mutateAsync({
        zoduId: editingCompany.zodu_id,
        payload: editPayload,
      });
    } else {
      console.log("✓ Calling createCompanyMutation");
      await createCompanyMutation.mutateAsync({
        restaurant_name: data.restaurant_name,
        owner_admin_name: data.owner_admin_name,
        gst_no: data.gst_no,
        phone_number: data.phone_number,
        email: data.email,
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2,
        city: data.city,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        bank_name: data.bank_name,
        bank_branch: data.bank_branch,
        holder_name: data.holder_name,
        account_number: data.account_number,
        account_type: data.account_type,
        ifsc_code: data.ifsc_code,
        can_use_for_branch: data.can_use_for_branch,
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: "#fff",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 1 },
      }}
    >
      <Box>
        <Stack spacing={2}>
          <Box
           
          >
            <Tabs
              value={activeTab}
              onChange={(_, value: SettingsTab) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 999,
                  bgcolor: redTint,
                },
              }}
            >
              <Tab
                label="Company"
                value="company"
                sx={{
                  minHeight: 48,
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              />
              <Tab
                label="Invoice settings"
                value="invoice"
                sx={{
                  minHeight: 48,
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              />
              <Tab
                label="User settings"
                value="user"
                sx={{
                  minHeight: 48,
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              />
            </Tabs>
          </Box>

          {activeTab === "company" && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 32 },
                  fontWeight: 800,
                  color: headingText,
                  lineHeight: 1.1,
                }}
              >
                Companies
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: subtleText,
                }}
              >
                Manage corporate entities and their global branch networks.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<DomainAddRoundedIcon />}
              onClick={openAddCompany}
              sx={{
                alignSelf: { xs: "stretch", sm: "center" },
                px: 2.5,
                py: 1.15,
                borderRadius: 1,
                bgcolor: redTint,
                boxShadow: "0 10px 24px rgba(202,0,34,0.22)",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#b1001d",
                },
              }}
            >
              Add New Company
            </Button>
          </Stack>
          )}

          {activeTab === "company" && companiesQuery.isError && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {(companiesQuery.error as Error | null)?.message ||
                "Unable to load company details."}
            </Alert>
          )}

          {submitError && activeTab === "company" && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {submitError}
            </Alert>
          )}

          {activeTab === "company" &&
          (companiesQuery.isLoading && companies.length === 0 ? (
            
            <Paper
              elevation={0}
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: cardBorder,
                bgcolor: "#fff",
                py: 5,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={28} />
            </Paper>
          ) : (
            <Stack spacing={1.75}>
              {companies.map((company, index) => {
                const expanded = expandedCompanyIds.includes(company.zodu_id);
                const companyBranches = company.branches ?? [];
                const branchCount = companyBranches.length;

                console.log(companies)

                return (
                  <Paper
                    key={company.zodu_id}
                    elevation={0}
                    sx={{
                      overflow: "hidden",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: cardBorder,
                      bgcolor: "#fff",
                    }}
                  >
                    <Box
                      onClick={() => toggleCompanyExpanded(company.zodu_id)}
                      sx={{
                        px: { xs: 2, md: 2.5 },
                        py: 2,
                        cursor: "pointer",
                        transition: "background-color 0.18s ease",
                        "&:hover": {
                          bgcolor: "#fcfcfe",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ minWidth: 0, flex: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: expanded ? "#fdecef" : "#f4f5f8",
                              color: expanded ? redTint : "#6f7785",
                            }}
                          >
                            {getCompanyIcon(index)}
                          </Avatar>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                md: "minmax(240px, 1.6fr) minmax(180px, 1fr) minmax(170px, 1fr)",
                              },
                              gap: { xs: 1.25, md: 3.5 },
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  letterSpacing: 0.7,
                                  color: "#b0b7c4",
                                  textTransform: "uppercase",
                                }}
                              >
                                Company Name
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.35 }}>
                                <Typography
                                  sx={{
                                    fontSize: 19,
                                    fontWeight: 800,
                                    color: headingText,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {company.restaurant_name}
                                </Typography>
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    sx={{ color: "#7a8392", flexShrink: 0 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingCompany(company);
                                    }}
                                  >
                                    <VisibilityOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>

                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  letterSpacing: 0.7,
                                  color: "#b0b7c4",
                                  textTransform: "uppercase",
                                }}
                              >
                                GSTIN
                              </Typography>
                              <Typography
                                sx={{
                                  mt: 0.35,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "#6f7785",
                                }}
                              >
                                {company.gst_no || "Not available"}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  letterSpacing: 0.7,
                                  color: "#b0b7c4",
                                  textTransform: "uppercase",
                                }}
                              >
                                Total Locations
                              </Typography>
                              <Box
                                sx={{
                                  mt: 0.45,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  px: 1.2,
                                  py: 0.45,
                                  borderRadius: 999,
                                  bgcolor: expanded ? "#fdecef" : "#f3f4f7",
                                  color: expanded ? redTint : "#7d8592",
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                {branchCount} Branch{branchCount === 1 ? "" : "es"}
                              </Box>
                            </Box>
                          </Box>
                        </Stack>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            sx={{ color: "#7a8392", flexShrink: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditCompany(company);
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <IconButton
                          size="small"
                          sx={{ color: "#a5adba", flexShrink: 0 }}
                        >
                          {expanded ? (
                            <ExpandLessRoundedIcon />
                          ) : (
                            <ExpandMoreRoundedIcon />
                          )}
                        </IconButton>
                      </Stack>
                    </Box>

                    {expanded && (
                      <Box
                        sx={{
                          px: { xs: 2, md: 2.5 },
                          pb: 2.25,
                          bgcolor: "#fffdfa",
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "#efeff4",
                            overflow: "hidden",
                            bgcolor: "#fff",
                          }}
                        >
                          <TableContainer
                            sx={{
                              maxHeight: 400,
                              overflow: "auto",
                              "&::-webkit-scrollbar": {
                                width: 8,
                                height: 8,
                              },
                              "&::-webkit-scrollbar-track": {
                                background: "transparent",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                background: "#cbd5e1",
                                borderRadius: "4px",
                                "&:hover": {
                                  background: "#94a3b8",
                                },
                              },
                            }}
                          >
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ bgcolor: "#fafbfc" }}>
                                  <TableCell
                                    sx={{
                                      borderBottomColor: "#f0f1f5",
                                      color: "#98a0ae",
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Branch Name
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      borderBottomColor: "#f0f1f5",
                                      color: "#98a0ae",
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Location
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      borderBottomColor: "#f0f1f5",
                                      color: "#98a0ae",
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Contact Number
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      borderBottomColor: "#f0f1f5",
                                      color: "#98a0ae",
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Actions
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {companyBranches.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                      <Typography sx={{ fontSize: 14, color: subtleText }}>
                                        No branches available for this company.
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  companyBranches.map((branch) => (
                                    <TableRow
                                      key={branch.branch_id}
                                      hover
                                      sx={{
                                        "& td": {
                                          borderBottomColor: "#f4f4f7",
                                        },
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          py: 2,
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color: headingText,
                                        }}
                                      >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          {branch.branch_name}
                                          <Tooltip title="View Details">
                                            <IconButton
                                              size="small"
                                              sx={{ color: "#7a8392", p: 0 }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingBranch(branch);
                                              }}
                                            >
                                              <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          py: 2,
                                          fontSize: 13,
                                          color: "#6f7785",
                                        }}
                                      >
                                        {formatLocation(branch)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          py: 2,
                                          fontSize: 13,
                                          color: "#6f7785",
                                        }}
                                      >
                                        {branch.branch_mobile_no || "Not available"}
                                      </TableCell>
                                      <TableCell align="right" sx={{ py: 1.25 }}>
                                        {/* <Tooltip title="View">
                                          <IconButton size="small" sx={{ color: "#7a8392" }}>
                                            <VisibilityOutlinedIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip> */}
                                        <Tooltip title="Edit">
                                          <IconButton
                                            size="small"
                                            sx={{ color: "#7a8392" }}
                                            onClick={() => openEditBranch(branch, company.zodu_id)}
                                          >
                                            <EditOutlinedIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                          <IconButton size="small" sx={{ color: "#7a8392" }}>
                                            <DeleteOutlineRoundedIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          <Divider />

                          <Box
                            sx={{
                              px: 2,
                              py: 1.5,
                              display: "flex",
                              justifyContent: "flex-end",
                              bgcolor: "#fff",
                            }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddRoundedIcon />}
                              onClick={() => openAddBranch(company.zodu_id)}
                              sx={{
                                borderRadius: 0.8,
                                bgcolor: redTint,
                                fontWeight: 700,
                                px: 1.6,
                                "&:hover": {
                                  bgcolor: "#b1001d",
                                },
                              }}
                            >
                              Add New Branch
                            </Button>
                          </Box>
                        </Paper>
                      </Box>
                    )}
                  </Paper>
                );
              })}

              {/* <Paper
                elevation={0}
                onClick={openAddCompany}
                sx={{
                  mt: 0.75,
                  borderRadius: 3,
                  border: "2px dashed",
                  borderColor: "#e7e9ef",
                  bgcolor: "rgba(255,255,255,0.55)",
                  px: 3,
                  py: { xs: 6, md: 7.5 },
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.18s ease, background-color 0.18s ease",
                  "&:hover": {
                    borderColor: "#d9dde7",
                    bgcolor: "#fff",
                  },
                }}
              >
                <Avatar
                  sx={{
                    mx: "auto",
                    width: 48,
                    height: 48,
                    bgcolor: "#f1f3f7",
                    color: "#96a0b0",
                  }}
                >
                  <AddRoundedIcon />
                </Avatar>
                <Typography
                  sx={{
                    mt: 2,
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#4a5565",
                  }}
                >
                  Register Another Company
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    maxWidth: 360,
                    mx: "auto",
                    fontSize: 14,
                    color: "#a0a7b3",
                    lineHeight: 1.7,
                  }}
                >
                  Expand your corporate network by onboarding a new entity.
                </Typography>
              </Paper> */}
            </Stack>
          ))}

          {activeTab === "invoice" && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: cardBorder,
                bgcolor: "#fff",
                px: { xs: 2, md: 3 },
                py: { xs: 3, md: 4 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 24, md: 28 },
                  fontWeight: 800,
                  color: headingText,
                }}
              >
                Invoice settings
              </Typography>
              <Typography sx={{ mt: 1, fontSize: 14, color: subtleText }}>
                Configure invoice preferences, numbering rules, tax details, and print layout from this section.
              </Typography>
            </Paper>
          )}

          {activeTab === "user" && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: cardBorder,
                bgcolor: "#fff",
                px: { xs: 2, md: 3 },
                py: { xs: 3, md: 4 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 24, md: 28 },
                  fontWeight: 800,
                  color: headingText,
                }}
              >
                User settings
              </Typography>
              <Typography sx={{ mt: 1, fontSize: 14, color: subtleText }}>
                Manage user-specific preferences, access setup, and profile-related settings here.
              </Typography>
            </Paper>
          )}
        </Stack>
      </Box>

<BranchFormModal
  open={branchModalOpen}
  onClose={closeBranchModal}
  branch={editingBranch}
  onSubmit={handleBranchSubmit}
  submitting={createBranchMutation.isPending || editBranchMutation.isPending}
  company={(() => {
    const c = companies.find(c => c.zodu_id === branchCompanyId);
    const cAny = c as (typeof c & { address_line_1?: string; address_line_2?: string }) | undefined;
    return {
      address_id: c?.address_id || "",
      bank_details_id: c?.bank_details_id || "",
      phone: c?.phone_number || c?.mobile_no || "",
      email: c?.email || c?.mail_id || "",
      address_line_1: cAny?.address_line_1 || c?.area_street_name || "",
      address_line_2: cAny?.address_line_2 || c?.building_no || "",
      area_street_name: c?.area_street_name || "",
      building_no: c?.building_no || "",
      city: c?.city || "",
      district: c?.district || "",
      state: c?.state || "",
      pincode: c?.pincode || "",
      bank_name: c?.bank_name || "",
      bank_branch: c?.bank_branch || "",
      holder_name: c?.holder_name || "",
      account_number: c?.account_number || "",
      account_type: c?.account_type || "",
      ifsc_code: c?.ifsc_code || "",
    };
  })()}
/>
      <BusinessFormModal
        open={companyModalOpen}
        onClose={closeCompanyModal}
        business={editingCompany}
        onSubmit={handleCompanySubmit}
        submitting={createCompanyMutation.isPending || editCompanyMutation.isPending}
      />

      {/* Company Details Modal */}
      <Dialog
        open={Boolean(viewingCompany)}
        onClose={() => setViewingCompany(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
            fontSize: 18,
            bgcolor: "#fafbfc",
            borderBottom: "1px solid #f0f1f5",
          }}
        >
          <span>Company Details</span>
          <IconButton
            size="small"
            onClick={() => setViewingCompany(null)}
            sx={{ color: "#6B7280" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {viewingCompany && (
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                  Company Name
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                  {viewingCompany.restaurant_name}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Owner / Admin Name
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.owner_admin_name || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    GSTIN
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.gst_no || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Phone Number
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.phone_number || viewingCompany.mobile_no || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Email ID
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.email || viewingCompany.mail_id || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    City
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.city || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    State
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.state || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    District
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.district || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Pincode
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.pincode || "Not available"}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                  Address
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                  {getCompanyAddressLine1(viewingCompany) || "Not available"}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Address Line 2
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getCompanyAddressLine2(viewingCompany) || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Bank Name
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.bank_name || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Bank Branch
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.bank_branch || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Account Holder Name
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.holder_name || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Account Number
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.account_number || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Account Type
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.account_type || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    IFSC Code
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingCompany.ifsc_code || "Not available"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Branch Details Modal */}
      <Dialog
        open={Boolean(viewingBranch)}
        onClose={() => setViewingBranch(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
            fontSize: 18,
            bgcolor: "#fafbfc",
            borderBottom: "1px solid #f0f1f5",
          }}
        >
          <span>Branch Details</span>
          <IconButton
            size="small"
            onClick={() => setViewingBranch(null)}
            sx={{ color: "#6B7280" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {viewingBranch && (
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                  Branch Name
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                  {viewingBranch.branch_name}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Mobile Number
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingBranch.branch_mobile_no || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Email ID
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingBranch.branch_mail_id || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    City
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getBranchCity(viewingBranch) || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    State
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getBranchState(viewingBranch) || "Not available"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Address Line 1
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getBranchAddressLine1(viewingBranch) || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Address Line 2
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getBranchAddressLine2(viewingBranch) || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    District
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getBranchDistrict(viewingBranch) || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Pincode
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getBranchPincode(viewingBranch) || "Not available"}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                  Manager / Admin
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                  {getBranchManager(viewingBranch) || "Not available"}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Bank Name
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingBranch.bank_name || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Bank Branch
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingBranch.bank_branch || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Account Holder Name
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {viewingBranch.holder_name || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Account Number
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getBranchAccountNumber(viewingBranch) || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    Account Type
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5, textTransform: "capitalize" }}>
                    {getBranchAccountType(viewingBranch) || "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#b0b7c4", textTransform: "uppercase" }}>
                    IFSC Code
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: headingText, mt: 0.5 }}>
                    {getBranchIfscCode(viewingBranch) || "Not available"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
