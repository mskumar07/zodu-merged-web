import React, { useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Button,
} from "@mui/material";

import ProductCard from "@components/ProductGrid/ProductCard";
import type { Product } from "../../types/product";
import { useAppDispatch, useAppSelector } from "../../store/store.ts";
import {
  toggleVariantModal,
  updateMenu,
  togglekgModal,
  setKgModalAction,
} from "../../store/slices/POSslice.ts";
import VariantModal from "../ProductGrid/VariantModal.tsx";

import type { Order } from "../../types/order";
import type { Dispatch, SetStateAction } from "react";
import type { MenuCategory, MenuItem } from "@hooks/useMenuItems.tsx";
import { getProductPrice } from "../../utils/util.ts";
import KgModal from "@components/ProductGrid/kgModal.tsx";
import { MENU_UNIT_KG } from "@pages/POS/index.tsx";

interface ProductAccordionProps {
  order: Order;
  setOrder: Dispatch<SetStateAction<Order>>;
  categories: MenuCategory[];
  onSelect: (product: Product) => void;
  activeCategory?: string;
  showHoldBar?: boolean;
  heldOrders?: { id: string; order: Order }[];
  onRestoreHeldOrder?: (id: string) => void;
}

const ProductAccordion: React.FC<ProductAccordionProps> = ({
  order,
  setOrder,
  categories,
  onSelect,
  activeCategory,
  showHoldBar,
  heldOrders,
  onRestoreHeldOrder,
}) => {
  const dispatch = useAppDispatch();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const variantModalStatus = useAppSelector(
    (state: any) => state.pos.variantModalStatus
  );

  const kgModalStatus = useAppSelector((state: any) => state.pos.kgModalStatus);
  const kgModalAction = useAppSelector((state: any) => state.pos.kgModalAction)
  const selectedProduct = useAppSelector(
    (state: any) => state.pos.selectedProduct
  );
  // React.useEffect(() => {
  //   if (activeCategory && sectionRefs.current[activeCategory]) {
  //     sectionRefs.current[activeCategory]?.scrollIntoView({
  //       behavior: "smooth",
  //       block: "nearest",
  //     });
  //   }
  // }, [activeCategory]);


  React.useLayoutEffect(() => {
  if (!activeCategory) return;

  const el = sectionRefs.current[activeCategory];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}, [activeCategory, categories]);

  const handleUpdateMenu = (title: string) => {
    if (activeCategory !== title) {
      dispatch(updateMenu(title));
    } else {
      dispatch(updateMenu(""));
    }
  };
  //Z-T76
  const isItemAlreadySelected = (id: string): boolean => {
    if (!id) return false;
    if (!order?.items) return false;
    return order.items.some((item) => item.product.menu_id === id);
  };

  const increaseItemQuantity = (product: MenuCategory, qty: string) => {

  setOrder((prev) => {
    if (!prev) return prev;

    const existingItem = prev.items.find((item) => {
      if (item.product.menu_id !== product.menu_id) return false;

      if (product.variant_id) {
        return item.product.variant_id === product.variant_id;
      }

      return !item.product.variant_id; // match items without variant
    });


      let updatedItems;

      if (existingItem) {
        // 🔥 CHANGE: Updated the matching logic in `map`
        updatedItems = prev.items.map((item) => {
          const isMatchingItem =
            item.product.menu_id === product.menu_id &&
            (product.variant_id
              ? item.product.variant_id === product.variant_id
              : !item.product.variant_id); // ensure matching no-variant case

          if (!isMatchingItem) return item;

          // For kg items: update quantity & price based on qty
          if (item.product.menu_unit === "kg") {
            const newQuantity = parseFloat(
              (Number(item.quantity) + Number(qty)).toFixed(2)
            );
            const newPrice = Number(product.sell_price) * newQuantity;

            return {
              ...item,
              quantity: newQuantity,
              product: {
                ...item.product,
                sell_price: newPrice,
              },
            };
          }

          // For non-kg items: simply increase quantity by 1
          return {
            ...item,
            quantity: Number(qty),
          };
        });
      } else {
        // add new item
        updatedItems = [
          ...prev.items,
          {
            product: {
              ...product,
              sell_price:
                product.menu_unit === "kg"
                  ? Number(product.sell_price) * Number(qty)
                  : product.sell_price,
            },
            quantity: product.menu_unit !== "kg" ? Number(qty) : qty,
          },
        ];
      }

      // recalculate subtotal
      const updatedSubtotal = updatedItems.reduce((sum, item) => {
        const price = getProductPrice(item.product);
        return (
          sum +
          (item.product.menu_unit === "kg"
            ? Number(price)
            : Number(price) * Number(item.quantity))
        );
      }, 0);
      const tax = prev.taxes ?? 0;
      const discount = prev.discount ?? 0;
      const updatedTotal =
      updatedSubtotal + tax  - discount;
      return {
      ...prev,
      items: updatedItems,
      subtotal: updatedSubtotal,
      total: Number(updatedTotal.toFixed(2)),
    };
  })

}

const calculateKgPrice = (pricePerKg: number, qtyInKg: number) => {
  return Number((pricePerKg * qtyInKg).toFixed(2));
};


const increaseItemQuantityByKg = (
  product: MenuCategory,
  qty: string,
  action: KgModalAction
) => {
  const qtyInKg = Number(qty);
  const pricePerKg = Number(product.sell_price);

  setOrder((prev) => {
    if (!prev) return prev;

    const existingItem = prev.items.find((item) => {
      if (item.product.menu_id !== product.menu_id) return false;

      if (product.variant_id) {
        return item.product.variant_id === product.variant_id;
      }

      return !item.product.variant_id;
    });

    let updatedItems: ProductItem[];

    if (existingItem) {
      updatedItems = prev.items
        .map((item) => {
          const isMatchingItem =
            item.product.menu_id === product.menu_id &&
            (product.variant_id
              ? item.product.variant_id === product.variant_id
              : !item.product.variant_id);

          if (!isMatchingItem) return item;

          let newQuantity = Number(item.quantity);
          /***
           * if it was add remove, edit follow the edit logic only
           */

          if (action === "add") {
            newQuantity = qtyInKg;
          }

          if (action === "remove") {
            newQuantity = qtyInKg;
          }

          if (action === "edit") {
            newQuantity = qtyInKg;
          }

          newQuantity = Number(newQuantity.toFixed(2));

          // ❌ remove item if qty <= 0
          if (newQuantity <= 0) return null;

          return {
            ...item,
            quantity: newQuantity,
            product: {
              ...item.product,
              sell_price: pricePerKg, // base per kg
            },
          };
        })
        .filter(Boolean) as ProductItem[];
    } else {
      // 🆕 add new kg item (only for add/edit)
      if (action === "remove") return prev;

      updatedItems = [
        ...prev.items,
        {
          product: {
            ...product,
            sell_price: pricePerKg,
          },
          quantity: qtyInKg,
        },
      ];
    }

    // ✅ KG-aware subtotal calculation
    const updatedSubtotal = updatedItems.reduce((sum, item) => {
      if (item.product.menu_unit === "kg") {
        return (
          sum +
          calculateKgPrice(
            Number(item.product.sell_price),
            Number(item.quantity)
          )
        );
      }

      return sum + Number(item.product.sell_price) * Number(item.quantity);
    }, 0);
   const tax = prev.taxes ?? 0;
  const discount = prev.discount ?? 0;
      const updatedTotal =
      updatedSubtotal + tax  - discount;

    return {
      ...prev,
      items: updatedItems,
      subtotal: updatedSubtotal,
      total: Number(updatedTotal.toFixed(2)),
    };
  });
};




  const getBaseMenuName = (menuName: string = "") => {
  return menuName.split(" - ")[0]?.trim() || menuName;
};

const updateProductNameAndPriceByVariant = (
  varaintName: string,
  varinatPrice: string,
  variantId: string
): MenuCategory => {
  const updatedProduct = {
    ...selectedProduct,
    menu_name: getBaseMenuName(selectedProduct?.menu_name || ""),
    variant_name: varaintName,
    sell_price: varinatPrice,
    variant_id: variantId,
  };

  return updatedProduct;
};

  const updateOrderbyKg = (price: string, qty: string) => {
    // increaseItemQuantity(selectedProduct as MenuCategory, qty as string);

    increaseItemQuantityByKg(selectedProduct as MenuCategory, qty,kgModalAction);
    handleKgCloseModal();
  };

  const getItemQuantity = (id: string) => {
    if (!order?.items) return 0;
    // const item = order.items.find((item) => item.product.menu_id === id); //Z-T76 updated the product
    // return item ? item.quantity : 0;
    
    return order.items
    .filter(item => item.product.menu_id === id)
    .reduce((total, item) => total + item.quantity, 0);
  };

  // const handleQuantityChange = (productId: string, qty: number) => {
  //   if (qty === 0) {
  //     return;
  //   }
  //   setOrder((prev) => ({
  //     ...prev,
  //     items: prev.items.map((item) =>
  //       item.product.menu_id === productId ? { ...item, quantity: qty } : item
  //     ),
  //     subtotal: prev.items.reduce(
  //       (sum, item) =>
  //         sum +
  //         (item.product.menu_id === productId
  //           ? getProductPrice(item.product) * qty
  //           : getProductPrice(item.product) * item.quantity),
  //       0
  //     ),
  //   }));
  // };

  //Z-T77 last minute update if breaks uncomment above
  // const handleQuantityChange = (productId: string, qty: number) => {
  //   setOrder((prev) => {
  //     // Remove item if qty is 0, otherwise update quantity
  //     const updatedItems =
  //       qty === 0
  //         ? prev.items.filter((item) => item.product.menu_id !== productId)
  //         : prev.items.map((item) =>
  //             item.product.menu_id === productId
  //               ? { ...item, quantity: qty }
  //               : item
  //           );

  //     // Recalculate subtotal
  //     const newSubtotal = updatedItems.reduce((sum, item) => {
  //       const price = getProductPrice(item.product);
  //       return (
  //         sum +
  //         (item.product.menu_unit === "kg"
  //           ? Number(price)
  //           : Number(price) * Number(item.quantity))
  //       );
  //     }, 0);

  //     return {
  //       ...prev,
  //       items: updatedItems,
  //       subtotal: newSubtotal,
  //     };
  //   });
  // };

  const handleQuantityChange = (productId: string, qty: number) => {
    const calulatedSubtotal = (items: ProductItem[]) => {
      return items.reduce(
        (sum, item) =>
          sum +
          (item.product.menu_id === productId
            ? getProductPrice(item.product) * qty
            : getProductPrice(item.product) * item.quantity),
        0
      );
    };
    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product.menu_id === productId ? { ...item, quantity: qty } : item
      ),
      subtotal: calulatedSubtotal(prev.items),
      total:
        calulatedSubtotal(prev.items) +
        (prev.taxes || 0) -
        (prev.discount || 0),
    }));
  };

  const handleCloseModal = () => {
    // Dispatch action to close modal
    dispatch(toggleVariantModal());
  };

  const handleKgCloseModal = () => {
    // Dispatch action to close modal
    dispatch(togglekgModal());
  };

  const getLastSelectedWeight = (productId: string | undefined) => {
    if (!order?.items || !productId) return "";
    const item = order.items.find((item) => item.product.menu_id === productId);
    return item ? item.quantity.toString() : "";
  }

  return (
    <>
      {/* <div>
        {categories.map((category:MenuCategory, index:number) => (
          <Accordion
            key={category.category || index}
            disableGutters
            elevation={0}
            square
            expanded={true}
            onChange={() => handleUpdateMenu(category.title)}
            ref={(el) => (sectionRefs.current[category.title] = el)} // 👈 attach ref
          >
            <AccordionSummary>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Typography fontWeight={600}>
                  {category.title || "Untitled"}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {category.categories.length > 0 ? (
                  category.categories.map((product) => {
                    if (product?.itemCards) {
                      return (
                        <React.Fragment key={product.title}>
                          
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="body1">
                              {product.title} ({product?.itemCards?.length})
                            </Typography>
                          </Grid>

                          
                          {product?.itemCards?.map(({ card }) => (
                            <Grid
                              size={{ xs: 12, sm: 6, md: 3 }}
                              key={card?.info.id}
                            >
                              <ProductCard
                                product={card?.info}
                                isSelected={isItemAlreadySelected(
                                  card?.info.id
                                )}
                                onSelect={() => onSelect(card.info)}
                                quantity={getItemQuantity(card?.info.id)}
                                onIncrement={() =>
                                  increaseItemQuantity(card?.info)
                                }
                                onDecrement={() =>
                                  decreaseItemQuantity(card?.info)
                                }
                              />
                            </Grid>
                          ))}
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <Grid
                          size={{ xs: 12, sm: 6, md: 3 }}
                          key={product.card?.info.id}
                        >
                          <ProductCard
                            product={product.card?.info}
                            isSelected={isItemAlreadySelected(
                              product.card?.info.id
                            )}
                            onSelect={() => onSelect(product.card?.info)}
                            quantity={getItemQuantity(product.card?.info.id)}
                            onIncrement={() =>
                              increaseItemQuantity(product.card?.info)
                            }
                            onDecrement={() =>
                              decreaseItemQuantity(product.card?.info)
                            }
                          />
                        </Grid>
                      );
                    }
                  })
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      No products
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </div> */}
      <Box sx={{ overflowY: "auto", height: "calc(100vh - 200px)" }}>
        {categories && categories.length > 0 ? (
          categories.some((cat) => cat.items.length > 0) ? (
            categories.map((category: MenuCategory, index: number) => {
              const categoryTitle = `${category.name} - ${category.items.length}`;

              return (
                category.items.length > 0 && (
                  <Accordion
                    key={categoryTitle || index}
                    disableGutters
                    elevation={0}
                    square
                    expanded={true}
                    onChange={() => handleUpdateMenu(categoryTitle)}
                    ref={(el: HTMLDivElement | null) => {
                      sectionRefs.current[categoryTitle] = el;
                    }}>
                    <AccordionSummary>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          alignItems: "center",
                        }}>
                        <Typography fontWeight={600}>
                          {categoryTitle || "Untitled"}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {category.items.map((product: MenuItem) => {
                          const menuId = product.menu_id;

                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 3}} key={menuId}>
                        <ProductCard
                          productName={product.menu_name}
                          productImage={product.menu_image}
                          productPrice={product.sell_price}
                          isSelected={isItemAlreadySelected(menuId)}
                          isVeg={product.food_type}
                          onSelect={() => onSelect(product)}
                          quantity={getItemQuantity(menuId)}
                          onIncrement={() =>
                          {
                            if(product?.menu_unit === MENU_UNIT_KG){
                              dispatch(togglekgModal());
                              dispatch(setKgModalAction("add"));
                            }else if(product?.variants?.length > 0){
                              dispatch(toggleVariantModal());
                            }
                            else{
                              handleQuantityChange(
                              menuId,
                              getItemQuantity(menuId) + 1
                            )
                          }}}
                          onDecrement={() =>{
                          if(product?.menu_unit === MENU_UNIT_KG){
                            dispatch(togglekgModal());
                            dispatch(setKgModalAction("remove"));
                          }else if(product?.variants?.length > 0){
                              dispatch(toggleVariantModal());
                            }else{
                            handleQuantityChange(
                              menuId,
                              getItemQuantity(menuId) - 1
                            )
                          }}}
                          onBulkUpdate={(qty: number) =>
                            handleQuantityChange(menuId, qty)
                          }
                        />
                      </Grid>
                    )
                  })}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )
              );
            })
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "text.secondary",
                border: "1px dashed",
                borderColor: "grey.300",
                borderRadius: 2,
                bgcolor: "grey.50",
                mx: 2,
                mt: 4,
              }}>
              <Typography variant="body1" fontWeight={500}>
                No items available in any category.
              </Typography>
            </Box>
          )
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "text.secondary",
              border: "1px dashed",
              borderColor: "grey.300",
              borderRadius: 2,
              bgcolor: "grey.50",
              mx: 2,
              mt: 4,
            }}>
            <Typography variant="body1" fontWeight={500}>
              No items available.
            </Typography>
          </Box>
        )}
      </Box>
      {selectedProduct?.menu_unit === MENU_UNIT_KG && (
        <KgModal
          open={kgModalStatus}
          onClose={handleKgCloseModal}
          price={selectedProduct?.sell_price}
          productName={selectedProduct?.menu_name}
          lastSelectedWeight={getLastSelectedWeight(selectedProduct?.menu_id)}
          onAdd={(price: string, qty: string) => {
            updateOrderbyKg(price as string, qty as string);
          }}
        />
      )}
      {selectedProduct &&
        selectedProduct?.variants !== null &&
        selectedProduct?.variants.length > 0 && (
          <VariantModal
            open={variantModalStatus}
            productName={selectedProduct?.menu_name}
            variant={selectedProduct?.variants ?? []}
            onClose={handleCloseModal}
            selectedProduct={selectedProduct}
            order={order}
            onAddVariants={(selectedVariants) => {
              selectedVariants.forEach((variant) => {
                const updatedProduct = updateProductNameAndPriceByVariant(
                  variant.name,
                  variant.price.toString(), // Convert price to string as increaseItemQuantity expects string for kg items
                  variant.id
                );
                // Ensure the quantity is passed correctly for the specific variant
                increaseItemQuantity(
                  updatedProduct as MenuCategory,
                  variant.quantity.toString()
                );
              });
              
            }}
          />
      )}
      {/* {showHoldBar && heldOrders.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            width: "55%",
            backgroundColor: "#fff",
            padding: 1.5,
            borderRadius: 2,
            boxShadow: 3,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            zIndex: 1200,
          }}
        >
          {heldOrders.map((held) => (
            <Button
              key={held.id}
              variant="contained"
              color="primary"
              onClick={() => onRestoreHeldOrder(held.id)}
            >
              {held.id}
            </Button>
          ))}
        </Box>
      )} */}
    </>
  );
};

export default ProductAccordion;

