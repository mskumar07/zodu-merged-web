import { useState } from "react";
import { Box, Stack, Typography, Button } from "@mui/material";
import AddBranchForm from "./AddBranchForm/index.tsx";
import AddRestaurantForm from "./AddRestaurantForm/index.tsx";
import styles from "./index.module.css";
import RestaurantDetailsPage from "./RestaurantDetails/index.tsx";
import BranchAccordion from "./BrandAccordion/index.tsx";

const RestaurantSetup = () => {
  const [isBranchAdded, setIsBranchAdded] = useState(false);

  const handleBranchSubmit = () => {
    // This will switch to the details + branches view
    setIsBranchAdded(true);
  };
  return (
    <Box className={styles.pageContainer}>
      {!isBranchAdded ? (
        <>
          <AddRestaurantForm />
          <AddBranchForm onSubmit={handleBranchSubmit} />
        </>
      ) : (
        <>
          <RestaurantDetailsPage />
          <Stack direction="row">
            <Typography variant="h5" m={2}>
              My Branches
            </Typography>
            <Box sx={{ flexGrow: 1 }}></Box>
            <Button>Add Branch</Button>
          </Stack>
          <Stack gap={3}>
            <BranchAccordion />
            <BranchAccordion />
            <BranchAccordion />
            <BranchAccordion />
          </Stack>
        </>
      )}
      {/* <BranchDetails /> */}
    </Box>
  );
};

export default RestaurantSetup;
