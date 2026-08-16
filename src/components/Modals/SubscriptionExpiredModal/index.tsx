import React from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

const BRAND_RED = "#c8101f";
const TEXT_PRIMARY = "#151822";
const TEXT_MUTED = "#8f93a3";

export interface SubscriptionExpiredModalProps {
  open: boolean;
  businessName: string;
  expiryDate?: string;
  onClose: () => void;
}

// Reusable "subscription expired" blocker — mount anywhere access to a
// business/company should be gated behind an active subscription.
const SubscriptionExpiredModal: React.FC<SubscriptionExpiredModalProps> = ({
  open,
  businessName,
  expiryDate,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted={false}
      transitionDuration={160}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            maxWidth: 380,
            width: "100%",
            boxShadow: "0 30px 70px rgba(17,24,39,0.22)",
          },
        },
      }}
    >
      <Box sx={{ p: { xs: 3, sm: 3.5 }, textAlign: "center" }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "rgba(220,38,38,0.09)",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 28 }} />
        </Box>

        <Typography sx={{ fontSize: 17, fontWeight: 800, color: TEXT_PRIMARY }}>
          Subscription Expired
        </Typography>

        <Typography sx={{ mt: 1, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>
          {businessName || "This business"}
          {"'s"} subscription{" "}
          {expiryDate ? (
            <>
              ended on{" "}
              <Box component="span" sx={{ fontWeight: 700, color: TEXT_PRIMARY }}>
                {expiryDate}
              </Box>
            </>
          ) : (
            "has ended"
          )}
          . Renew to continue accessing this business.
        </Typography>

        <Box
          sx={{
            mt: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            px: 1.5,
            py: 1,
            borderRadius: "10px",
            bgcolor: "#f6f3f1",
            border: "1px solid #efebe7",
          }}
        >
          <PhoneOutlinedIcon sx={{ fontSize: 15, color: "#78664f" }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#78664f" }}>
            Contact support to renew this subscription
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            mt: 2.5,
            py: 1.1,
            borderRadius: "10px",
            bgcolor: BRAND_RED,
            color: "#fff",
            boxShadow: "0 8px 18px rgba(200,16,31,0.2)",
            textTransform: "none",
            fontSize: 13.5,
            fontWeight: 800,
            "&:hover": { bgcolor: "#a80d19" },
          }}
        >
          Back to Business List
        </Button>
      </Box>
    </Dialog>
  );
};

export default SubscriptionExpiredModal;
