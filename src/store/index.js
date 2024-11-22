import { configureStore } from '@reduxjs/toolkit';
import stageReducer from './stageSlice'; // 确保你的 slice 文件名和导出正确

export const store = configureStore({
  reducer: {
    stage: stageReducer,
  },
});

