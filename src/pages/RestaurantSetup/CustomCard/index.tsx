import React from "react";
import { Card, CardContent, Box, Typography, Divider } from "@mui/material";
import styles from "./index.module.css";
import LabelValueDisplay from "@components/LabelValueDisplay/index.tsx";
import ScheduleDaySlots from "@components/ScheduleDaySlots/index.tsx";

interface RestaurantInfo {
  name?: string;
  mobile?: string;
  email?: string;
  gst?: string;
  address?: string;
  accountNumber?: string;
  accountType?: string;
  ifscCode?: string;
}

interface Slot {
  label?: string;
  start?: string;
  end?: string;
}

interface BranchWithSchedule {
  name?: string;
  mobile?: string;
  email?: string;
  fssai?: string;
  address?: string;
  totalTables?: number;
  schedule?: {
    [day: string]: Slot[];
  };
}

type CardType = "restaurant" | "branchWithSchedule";

interface Props {
  type: CardType;
  data: RestaurantInfo | BranchWithSchedule;
}

const CustomCard: React.FC<Props> = ({ type, data }) => (
  <Card className={styles.cardContainer}>
    <CardContent>
      {type === "restaurant" &&
        (() => {
          const restaurant = data as RestaurantInfo;
          return (
            <Box className={styles.detailsRow}>
              <Box className={styles.section}>
                <Typography className={styles.header}>
                  {restaurant?.name}
                </Typography>
                <LabelValueDisplay label="Mobile" value={restaurant?.mobile} />
                <LabelValueDisplay label="Mail" value={restaurant?.email} />
                <LabelValueDisplay label="GST" value={restaurant?.gst} />
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box className={styles.section}>
                <Typography className={styles.header}>Address</Typography>
                <Typography className={styles.value}>
                  {restaurant?.address ?? "-"}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box className={styles.section}>
                <Typography className={styles.header}>Bank Details</Typography>
                <LabelValueDisplay
                  label="Account Number"
                  value={restaurant?.accountNumber}
                />
                <LabelValueDisplay
                  label="Account Type"
                  value={restaurant?.accountType}
                />
                <LabelValueDisplay label="IFSC" value={restaurant?.ifscCode} />
              </Box>
            </Box>
          );
        })()}

      {type === "branchWithSchedule" &&
        (() => {
          const branchWithSchedule = data as BranchWithSchedule;
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 5,
                height: "400px",
              }}
            >
              {/* Branch Details */}
              <Box className={styles.detailsRow}>
                <Box className={styles.section}>
                  <Typography className={styles.header}>
                    {branchWithSchedule?.name
                      ? `${branchWithSchedule.name} (Active)`
                      : "(Active)"}
                  </Typography>
                  <LabelValueDisplay
                    label="Mobile"
                    value={branchWithSchedule?.mobile}
                  />
                  <LabelValueDisplay
                    label="Mail"
                    value={branchWithSchedule?.email}
                  />
                  <LabelValueDisplay
                    label="FSSAI"
                    value={branchWithSchedule?.fssai}
                  />
                  <LabelValueDisplay
                    label="Total Tables"
                    value={branchWithSchedule?.totalTables}
                  />
                  <Typography className={styles.header}>Address</Typography>
                  <Typography className={styles.value}>
                    {branchWithSchedule?.address ?? "-"}
                  </Typography>
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem />
              {/* Schedule Section */}
              <Box className={styles.timetable}>
                <Typography className={styles.header}>
                  Weekly Schedule
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    // flexDirection: "column",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {branchWithSchedule?.schedule &&
                    Object.entries(branchWithSchedule.schedule).map(
                      ([day, slots]) => (
                        <ScheduleDaySlots key={day} day={day} slots={slots} />
                      )
                    )}
                </Box>
              </Box>
            </Box>
          );
        })()}
    </CardContent>
  </Card>
);

export default CustomCard;
