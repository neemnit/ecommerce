import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axios";
import { AxiosError } from "axios";

export interface Address {
  _id?: string;
  userId?: string;
  orderId?: string;
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  houseNo: string;
  road?: string;
  area?: string;
  deliveryStatus?: "Pending" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AddressState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  editAddressId: string | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
  isEditing: false, // Track if an address is being edited
  editAddressId: null, // Store the ID of the address being edited
};

export const getAddress = createAsyncThunk("address/getAddress", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("No auth token found. Please log in.");
    }
    const response = await axiosInstance.get("/getAddress", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to fetch addresses");
  }
});

export const addAddress = createAsyncThunk("address/addAddress", async (addressData: Address, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("No auth token found. Please log in.");
    }
    const response = await axiosInstance.post("/addAddress", addressData, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to add address");
  }
});

export const deleteAddress = createAsyncThunk("address/deleteAddress", async (id: string, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("No auth token found. Please log in.");
    }
    await axiosInstance.delete(`/api/addresses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to delete address");
  }
});

// ✅ New Async Thunk - Edit Address
export const editAddress = createAsyncThunk(
  "address/editAddress",
  async ({ id, updatedData }: { id: string; updatedData: Address }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return rejectWithValue("No auth token found. Please log in.");
      }
      const response = await axiosInstance.put(`/api/addresses/${id}`, updatedData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to update address");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // ✅ Reducer to Set Edit Mode
    setEditing: (state, action: PayloadAction<string>) => {
      state.isEditing = true;
      state.editAddressId = action.payload;
    },
    // ✅ Reducer to Clear Edit Mode
    clearEditing: (state) => {
      state.isEditing = false;
      state.editAddressId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(getAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = [action.payload, ...state.addresses]; // Prepend new address
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter((addr) => addr._id !== action.payload);
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(editAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.map((addr) =>
          addr._id === action.payload._id ? action.payload : addr
        ); // Update the address in the state
        state.isEditing = false;
        state.editAddressId = null;
      })
      .addCase(editAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setEditing, clearEditing } = addressSlice.actions;
export default addressSlice.reducer;
