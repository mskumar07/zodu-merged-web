import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@store/store";

interface Userstate {
  branchId: string;
  zoduId: string;
}

const initialState: Userstate = {
  branchId: "ZODU035B1",
  zoduId: "ZODU035",
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    addUserData: (state, action: PayloadAction<{ branchId: string; zoduId: string }>) => {
      state.branchId = action.payload.branchId;
      state.zoduId = action.payload.zoduId;
    },
  },
});

export const { addUserData } = userSlice.actions;

export const BranchId = (state: RootState) => state.user.branchId;
export const ZoduId = (state: RootState) => state.user.zoduId;

export default userSlice.reducer;
