//Z-T97
import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { MenuItem } from '../../types/menuItem'; // Using the existing MenuItem interface
import { styled } from '@mui/system';
import nonveg from "../../assets/icons/TableIcons/non-veg.png";
import veg from "../../assets/icons/TableIcons/veg.png";
import VariantTable from "./VariantTable.tsx"

interface ItemViewModalProps {
  item: MenuItem|null;
  open: boolean;
  onClose: () => void;
}

const StyledModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%', // Adjust width as needed
  maxWidth: 800, // Max width for larger screens
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  outline: 'none',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
}));

const MenuItemViewModal: React.FC<ItemViewModalProps> = ({ item, open, onClose }) => {
  const theme = useTheme();

  if(!item) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="item-view-modal-title"
    >
      <StyledModalContent>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: "relative",
                width: "92%",
                height: 200, // Fixed height box
                borderRadius: 1,
                overflow: "hidden", // Ensures image stays inside
                bgcolor: theme.palette.background.productCard,
              }}
            >
              {item.menu_image ? (
                <Box
                  component="img"
                  src={item.menu_image}
                  alt={item.menu_name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover", // Forces perfect crop & fit
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: theme.palette.background.productCard,
                    color: theme.palette.customText.productCard,
                    fontSize: "3rem",
                  }}
                >
                  {item.menu_name.substring(0, 2).toUpperCase()}
                </Box>
              )}

              {/* Top Right Corner Icon (veg/non-veg placeholder image) */}
              <Box
                component="img"
                src={item.food_type == "Veg" ? veg : nonveg}
                alt="veg/non-veg"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 15,
                  width: 20,
                  height: 20,
                }}
              />
            </Box>
          </Grid>

          {/* Details Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {item.menu_name}
            </Typography>
            <Chip
              label={item.category}
              size="small"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                marginBottom: 1,
              }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Item ID: {item.menu_id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Quantity: {item.count}
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
              Price: ₹ {parseFloat(item.sell_price).toFixed(2)}{" "}
              {/* Parse as float */}
            </Typography>
            <Typography variant="body1" color="text.primary">
              Tax: {parseFloat(item.gst_tax).toFixed(2)}% {/* Parse as float */}
            </Typography>
            {/* Variant List */}
            <Box sx={{mt:1}}>
             <VariantTable variantList={item.variants} />
            </Box>
          </Grid>
        </Grid>
      </StyledModalContent>
    </Modal>
  );
};

export default MenuItemViewModal;
