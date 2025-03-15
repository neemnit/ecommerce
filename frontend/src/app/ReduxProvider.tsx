"use client";

import { Provider } from "react-redux";
import store from "./store";
import { useEffect } from "react";
import { useAppDispatch } from "./hook";
import { fetchUserById, setUser } from "./features/users/userSlice";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "./page";
import { getAddress } from "./features/address/addressSlice";
import { fetchProducts } from "./features/products/productSlice";
import {  getUserOrder } from "./features/order/orderSlice";
// Define the type for the decoded token


function AuthChecker() {
  const dispatch = useAppDispatch();
 // Get user from Redux

   // Log user state

  useEffect(() => {
    const checkAuth = async () => {
      let token: string | null = localStorage.getItem("accessToken");

      if (!token) return;

      try {
        const decoded: DecodedToken = jwtDecode<DecodedToken>(token);

        if (decoded.exp * 1000 < Date.now()) {
          // Refresh token logic
          const res = await axios.post("http://localhost:4545/refresh-token", {}, { withCredentials: true });
          localStorage.setItem("accessToken", res.data.accessToken);
          token = res.data.accessToken;
        }

        if (token) {
         
          dispatch(fetchUserById(decoded.id));
          dispatch(setUser(jwtDecode<DecodedToken>(token)));
           // Update Redux store
           dispatch(getAddress())
           dispatch(fetchProducts())
          dispatch(getUserOrder(decoded.id))
       

        }
      } catch (error) {
        console.error("Token verification failed", error);
        localStorage.removeItem("accessToken");
      }
    };

    checkAuth();
  }, [dispatch]);

  return null; // No UI needed
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthChecker /> {/* Handles authentication check */}
      {children}
    </Provider>
  );
}
