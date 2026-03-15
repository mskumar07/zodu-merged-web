import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@store/store";

import type { Order } from "../../types/order";

interface POSstate {
  selectedMenu: string;
  searchProduct: {
    id: string;
    name: string;
  }| null;
  selectedProduct: any;
  variantModalStatus: boolean;
  orderMode: "DineIn" | "Delivery" | "PickUp";
  discountType: "Percent" | "Amount";
  discountValue: number;
  SelectedTable: number | null; //Z-T77,
  activeDineInTableOrders: Order[] | any[]; //Z-T77
  kgModalStatus:boolean;
  kgModalAction:string;
}

const initialState: POSstate = {
  selectedMenu: "",
  searchProduct: null,
  variantModalStatus: false,
  kgModalStatus:false,
  kgModalAction:"",
  selectedProduct: null,
  orderMode: "DineIn",
  discountType: "Percent",
  discountValue: 0,
  SelectedTable: null, //z-T77,
  activeDineInTableOrders: [], //Z-T77
};

const counterSlice = createSlice({
  name: "posSlice",
  initialState,
  reducers: {
    updateMenu: (state, action) => {
      state.selectedMenu = action.payload;
    },
    updateDiscountType: (state, action) => {
      state.discountType = action.payload;
    },
    updateDiscountValue: (state, action) => {
      state.discountValue = action.payload;
    },
    setSearchProduct: (state, action) => {
      state.searchProduct = action.payload;
    },
    toggleVariantModal: (state) => {
      state.variantModalStatus = !state.variantModalStatus;
    },
     togglekgModal: (state) => {
      state.kgModalStatus = !state.kgModalStatus;
    },
    setKgModalAction: (state, action) => {
      state.kgModalAction = action.payload;
    },
    setSelectedProduct: (state, action) => {
      console.log("Setting selected product in slice:", action.payload);
      state.selectedProduct = action.payload;
    },
    setOrderMode: (state, action) => {
      state.orderMode = action.payload;
    },
    // Z-T77
    setSelectedTable: (state, action) => {
      state.SelectedTable = action.payload;
    },
    // Z-T77
    setActiveDineInTableOrders: (state, action:PayloadAction<any>) => {
      const { tableNumber } = action.payload;

      // Find if this table already exists
      const existingIndex = state.activeDineInTableOrders.findIndex(
        (order) => order.tableNumber === tableNumber
      );

      if (existingIndex !== -1) {
        // Replace existing entry with new payload
        state.activeDineInTableOrders[existingIndex] = action.payload;
      } else {
        // Add new entry
        state.activeDineInTableOrders.push(action.payload);
      }
    },
    //zodu-hotfix-01
    updateActiveDineInTableOrders: (state, action:PayloadAction<any>) => {
      state.activeDineInTableOrders = action.payload;
    }
  },
});

export const {
  updateMenu,
  toggleVariantModal,
  setSelectedProduct,
  togglekgModal,
  setOrderMode,
  updateDiscountType,
  updateDiscountValue,
  setSelectedTable, //Z-T77
  setActiveDineInTableOrders, //Z-T77
  updateActiveDineInTableOrders, //zodu-hotfix-01
  setKgModalAction,
  setSearchProduct,
} = counterSlice.actions;

export const OrderMode = (state: RootState) => state.pos.orderMode;
export const SelectedMenu = (state: RootState) => state.pos.selectedMenu;
export const SearchProduct = (state: RootState) => state.pos.searchProduct;
export const DiscountType = (state: RootState) => state.pos.discountType;
export const DiscountValue = (state: RootState) => state.pos.discountValue;
export const VariantModalStatus = (state: RootState) =>
  state.pos.variantModalStatus;
export const KgModalStatus =(state :RootState)=> state.pos.kgModalStatus;
export const KgModalAction =(state :RootState)=> state.pos.kgModalAction;
export const SelectedProduct = (state: RootState) => state.pos.selectedProduct;
export const SelectedTable = (state: RootState) => state.pos.SelectedTable; //Z-T77
export const ActiveDineInTableOrders = (state: RootState) =>
  state.pos.activeDineInTableOrders; //Z-T77

export default counterSlice.reducer;
