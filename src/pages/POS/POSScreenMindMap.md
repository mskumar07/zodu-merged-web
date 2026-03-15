# POSScreen Component Hierarchy Mind Map

This document outlines the component hierarchy for the `POSScreen` component, including its children, grandchildren, and great-grandchildren components, to provide a clear overview of its structure.

```
POSScreen (src/pages/POS/index.tsx)
├── CombinedFilterBar (src/components/CombinedFilterBar/index.tsx)
│   ├── SearchBarWithAutocomplete (src/components/CombinedFilterBar/SearchBarWithAutocomplete/index.tsx)
│   └── CategoryToggleChipGroup (src/components/CombinedFilterBar/CategoryToggleChipGroup/index.tsx)
├── CreateCustomerModal (src/components/Modals/CreateCustomerModal/index.tsx)
├── OrderSummarySidebar (src/components/OrderSummary/OrderSummarySidebar.tsx)
│   ├── OrderTypeSelector (src/components/OrderSummary/OrderTypeSelector.tsx)
│   ├── OrderInfoSection (src/components/OrderSummary/OrderInfoSection.tsx)
│   ├── OrderSection (src/components/OrderSummary/OrderSection.tsx)
│   │   ├── OrderProductListItem (src/components/OrderSummary/OrderProductListItem.tsx)
│   │   └── KOTListCards (src/components/OrderSummary/KOTListCards.tsx)
│   ├── PaymentMethodSelector (src/components/OrderSummary/PaymentMethodSelector.tsx)
│   ├── CashInputSection (src/components/OrderSummary/CashInputSection.tsx)
│   ├── PaidButton (src/components/OrderSummary/PaidButton.tsx)
│   └── SelectTableModal (src/components/OrderSummary/SelectTableModal.tsx)
├── ProductAccordion (src/components/ProductAccordion/index.tsx)
│   ├── ProductCard (src/components/ProductGrid/ProductCard.tsx)
│   │   └── QuantityBox (src/components/ProductGrid/QuantityBox.tsx)
│   ├── VariantModal (src/components/ProductGrid/VariantModal.tsx)
│   │   └── VariationList (src/components/ProductGrid/VariationList.tsx)
│   └── KgModal (src/components/ProductGrid/kgModal.tsx)
└── OrderBar (src/pages/POS/OrderBar.tsx)
