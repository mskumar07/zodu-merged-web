import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./index.module.css";
import { useTheme } from "@mui/material/styles";

interface SubscriptionNoticeProps {
  percentage: number;
  onClose: () => void;
}

const SubscriptionNotice: React.FC<SubscriptionNoticeProps> = ({
  percentage,
  onClose,
}) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={1}
      className={styles.noticePaper}
      sx={{ bgcolor: theme.palette.background.paper }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
        }}
      >
        <IconButton
          size="small"
          aria-label="close"
          onClick={onClose}
          className={styles.closeButton}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box className={styles.progressWrapper}>
        <Box className={styles.progressCircle}>
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={50}
            thickness={3}
            sx={{ color: (theme) => theme.palette.subscription.main }}
          />
          <Box className={styles.progressCenter}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {percentage}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Typography className={styles.noticeSubtitle} variant="subtitle1">
        Subscription Plan
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        Your Subscription plan will expire soon, please upgrade!
      </Typography>
      <Button
        className={styles.upgradeButton}
        variant="text"
        size="small"
        sx={{
          color: theme.palette.subscription.main,
        }}
      >
        Upgrade
      </Button>
    </Paper>
  );
};

export default SubscriptionNotice;
