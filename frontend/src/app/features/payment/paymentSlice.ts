


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axios";
import { AxiosError } from "axios";

// Define the Payment Type
export interface Payment {
  _id?: string; // MongoDB uses `_id`
  orderId: string;
  paymentMethod:
    | "Credit Card"
    | "Debit Card"
    | "UPI"
    | "Net Banking"
    | "Cash on Delivery";
  paymentStatus: "Pending" | "Completed" | "Failed" | "Refunded";
  transactionId?: string | null;
  paymentId?:string;
}

interface PaymentState {
  payment: Payment | null;
  loading: boolean;
  error: string | null;
  message: string;
}

const initialState: PaymentState = {
  payment: null,
  loading: false,
  error: null,
  message: "",
};

// ✅ Async Thunk to Create Payment
export const createPayment = createAsyncThunk<
  Payment,
  Payment,
  { rejectValue: string }
>("payment/createPayment", async (paymentData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("No auth token found. Please log in.");
    }

    const response = await axiosInstance.post("/payments", paymentData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    

    return response.data; // Ensure it contains `_id`
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to create payment"
    );
  }
});

// ✅ Async Thunk to Verify Payment
export const verifyPayment = createAsyncThunk<
  Payment,
  { session_id: string; paymentId: string },
  { rejectValue: string }
>(
  "payment/verifyPayment",
  async ({ session_id, paymentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return rejectWithValue("No auth token found. Please log in.");
      }

      const response = await axiosInstance.get("/success", {
        params: { session_id, paymentId },
        headers: { Authorization: `Bearer ${token}` },
      });

    

      return response.data; // Ensure it returns updated payment details
    } catch (error) {
      
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to verify payment"
      );
    }
  }
);

// ✅ Payment Slice
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    // ✅ Reset Payment State
    resetPayment: (state) => {
      state.payment = null;
      state.loading = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Handle Create Payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "Processing payment...";
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload;
        state.error = null;
        state.message = "Payment created successfully!";
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create payment.";
        state.message = "";
      })

      // 🔹 Handle Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "Verifying payment...";
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload;
        state.error = null;
        state.message = "Payment verified successfully!";
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to verify payment.";
        state.message = "";
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
