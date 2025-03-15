import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/products/productSlice"
import userReducer from "./features/users/userSlice"
import addressReducer from "./features/address/addressSlice"
import authReducer from "./features/auth/authSlice"
import orderReducer from "./features/order/orderSlice"
import paymentReducer from "./features/payment/paymentSlice"
const store=configureStore({
    reducer:{
        products:productReducer,
        user:userReducer,
        address:addressReducer,
        auth: authReducer,
        order:orderReducer,
        payment:paymentReducer
    }
})

export default store
export type RootState=ReturnType<typeof store.getState>
export type AppDispatch=typeof store.dispatch