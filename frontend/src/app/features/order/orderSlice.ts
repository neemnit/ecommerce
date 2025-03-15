import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "@/app/config/axios";
export interface Variant {
     size?: string;
   color?: string;
   stock?:number
   }
   interface ShippingAddress {
      _id: string;
      state: string;
      city: string;
    }
interface Product {
    name: string;
    price: number;
    productId: {
      _id: string;
      name: string;
      description?: string;
      category?: string;
      price?: number;
      images?: string[];
    };
    quantity: number;
    variant?: Variant;
    _id?: string;
  }
// Define the Order structure
export interface Order {
  orderId: string;
  userId: string;
  products: Product[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  deliveryDate: string;
  shippingAddressId?: string| ShippingAddress;
  _id?: string;
}

// Define State Structure
interface OrderState {
  order: Order | null;
  userOrders: Order[]; // Store multiple orders for a user
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: OrderState = {
  order: null,
  userOrders: [], // Initialize as empty array
  loading: false,
  error: null,
};

// Async thunk for creating an order
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData: Order, { rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");
    try {
      if (!token) {
        return rejectWithValue("No auth token found. Please log in.");
      }
      const response = await axiosInstance.post("/createOrder", orderData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data || "Failed to create order");
    }
  }
);

// Async thunk for fetching an order by ID
export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (orderId: string, { rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");
    try {
      if (!token) {
        return rejectWithValue("No auth token found. Please log in.");
      }
      const response = await axiosInstance.get(`/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data || "Failed to fetch order");
    }
  }
);

// Async thunk for fetching user orders
export const getUserOrder = createAsyncThunk(
  "order/getUserOrder",
  async (userId: string, { rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");
    try {
      if (!token) {
        return rejectWithValue("No auth token found. Please log in.");
      }
      const response = await axiosInstance.get(`/orders/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data; // Returns an array of orders
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data || "Failed to fetch user orders");
    }
  }
);

// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {}, // No manual reducers needed for now
  extraReducers: (builder) => {
    builder
      // Create Order Cases
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Order Cases
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get User Orders
      .addCase(getUserOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrder.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.userOrders = action.payload; // Store user orders
      })
      .addCase(getUserOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export the reducer
export default orderSlice.reducer;
