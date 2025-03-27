import { configureStore } from "@reduxjs/toolkit";
import productSlice from "./features/products/productSlice"
const store=configureStore({
    reducer:{
        // Add reducers here
        product: productSlice,
    }
})
export default store
export type RootState=ReturnType<typeof store.getState>
export type AppDispatch=typeof store.dispatch