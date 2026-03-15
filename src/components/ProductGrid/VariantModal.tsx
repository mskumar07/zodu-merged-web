import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import VariationList from "./VariationList";
import type { Variation } from "./VariationList";



interface VariantModalProps {
  open: boolean;
  selectedProduct:any,
  order:any,
  productName?: string;
  variant: Variation[];
  onClose: () => void;
  onAddVariants: (variants: { id: string; name: string; price: number; quantity: number }[]) => void;
}

export function getInitialQuantitiesFromOrder(
  selectedProduct: SelectedProduct,
  order?: Order
) {
  // initialize all variants with quantity 0
  const initialQuantities = selectedProduct.variants.reduce(
    (acc, v) => {
      acc[v.id] = 0;
      return acc;
    },
    {} as Record<string, number>
  );

  if (!order?.items?.length) {
    return initialQuantities;
  }

  order.items.forEach((item) => {
    const isSameMenu =
      item.product.menu_id === selectedProduct.menu_id;

    const variantId = item.product.variant_id;

    if (isSameMenu && variantId && variantId in initialQuantities) {
      initialQuantities[variantId] = item.quantity;
    }
  });

  return initialQuantities;
}

const VariantModal: React.FC<VariantModalProps> = ({
  open,
  variant,
  selectedProduct,
  order,
  onClose,
  onAddVariants,
  productName,
}) => {
  // const [quantities, setQuantities] = useState<{ [key: string]: number }>(
  //     variant?.reduce((acc, variant) => ({ ...acc, [variant.id]: 0 }), {})
  //   );
  
   const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (open) {
      // const initialQuantities = variant.reduce(
      //   (acc, v) => ({ ...acc, [v.id]: 0 }),
      //   {}
      // );
      const initalQuantityFromFn = getInitialQuantitiesFromOrder(selectedProduct, order)
      setQuantities(initalQuantityFromFn);
    }
  }, [open, variant]);
  if (!variant) return null;
     
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Variant for {productName}</DialogTitle>
      <VariationList variants={variant} quantities={quantities}
            setQuantities={setQuantities} /> {/* onSelect prop removed as it's handled by "Add" button */}
      <DialogActions>
        <Box sx={{backgroundColor: 'primary.main', borderRadius: 1, px: 1, mr: 2}}>
           <Button onClick={()=>{
            const selectedVariants = variant.filter(v => quantities[v.id] > 0)
                                            .map(v => ({
                                              id: v.id,
                                              name: v.variant_name,
                                              price: parseFloat(v.price as any), // Explicitly parse to number
                                              quantity: quantities[v.id]
                                            }));
            onAddVariants(selectedVariants);
            onClose(); // Close modal after adding variants
           }}  sx={{color: 'white'}}>
          Add
        </Button>
        </Box>
       
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VariantModal;
