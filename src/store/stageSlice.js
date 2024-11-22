import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chooseNumber:'4'
};

const stageSlice = createSlice({
  name: "stage",
  initialState,
  reducers: {
    changeChooseNumber(state, action) {
      // 直接存储字符串形式的 moodData
      state.chooseNumber = action.payload;
    },
  },
});

export const {
  changeChooseNumber
} = stageSlice.actions;

export default stageSlice.reducer;

