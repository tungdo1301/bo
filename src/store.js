import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counterSlice';
import apiReducer from './features/apiSlice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        api: apiReducer,
    }
});
