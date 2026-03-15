import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Box,
  Typography,
  Avatar,
} from "@mui/material";

import BranchDetails from "../BranchDetails";

const BranchAccordion: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  // const [editable, setEditable] = useState(false);
  // const [toggle, setToggle] = useState(false); // For top-right toggle

  // // Handler for toggle switch
  // const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
  //   setToggle(event.target.checked);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      elevation={0}
      // sx={{
      //   border: "1px solid #f0f0f0",
      //   borderRadius: 2, // optional rounded corners
      //   boxShadow: expanded ? "none" : undefined,
      //   backgroundColor: expanded ? "transparent" : undefined,
      //   "&:before": {
      //     display: "none",
      //   },
      // }}

      sx={{
        minHeight: expanded ? 0 : 48, // default is 48px, set to 0 when expanded
        border: "1px solid #f0f0f0",
        "&.Mui-expanded": {
          minHeight: 0, // remove height when expanded
        },
        "& .MuiAccordionSummary-content": {
          margin: 0,
        },
        "& .MuiAccordionSummary-content.Mui-expanded": {
          margin: 0,
        },
        "&:before": {
          display: "none",
        },
        padding: expanded ? 0 : undefined, // optional: remove padding completely
      }}
    >
      <AccordionSummary>
        {expanded ? (
          <Grid
            container
            alignItems="center"
            spacing={2}
            sx={{ width: "100%", m: 0, p: 2 }} // force full width
          >
            {/* Branch Image */}
            <Grid size={{ xs: 2, md: 1 }}>
              <Avatar
                src="https://via.placeholder.com/60"
                alt="Branch"
                sx={{ width: 60, height: 60, borderRadius: 2 }}
              />
            </Grid>

            {/* Branch Id & Name */}
            <Grid size={{ xs: 10, md: 3 }}>
              <Box>
                <Typography variant="caption" color="error" fontWeight={600}>
                  Branch Id : B2
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Chennai - Adyar
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Grid
            container
            alignItems="center"
            spacing={2}
            sx={{ width: "100%", m: 0, p: 2 }} // force full width
          >
            {/* Branch Image */}
            <Grid size={{ xs: 2, md: 1 }}>
              <Avatar
                src="https://via.placeholder.com/60"
                alt="Branch"
                sx={{ width: 60, height: 60, borderRadius: 2 }}
              />
            </Grid>

            {/* Branch Id & Name */}
            <Grid size={{ xs: 10, md: 3 }}>
              <Box>
                <Typography variant="caption" color="error" fontWeight={600}>
                  Branch Id : B2
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Chennai - Adyar
                </Typography>
              </Box>
            </Grid>

            {/* Manager */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Branch Manager / Admin
              </Typography>
              <Typography variant="body1">Darrell Steward</Typography>
            </Grid>

            {/* Mobile No */}
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Mobile No
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                +91 9876453672
              </Typography>
            </Grid>

            {/* Mail ID */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Mail ID
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                xyz@gmail.com
              </Typography>
            </Grid>
          </Grid>
        )}
      </AccordionSummary>

      <AccordionDetails>
        {/* Inner component goes here */}
        <BranchDetails />
      </AccordionDetails>
    </Accordion>
  );
};

export default BranchAccordion;
