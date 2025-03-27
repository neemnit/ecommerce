import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../../config/axios";
import { AxiosError } from "axios";

// Define the Variant type
export type Variant = {
  size: string;
  color: string;
  stock: number;
  price: number;
  _id?: string;
};

// Define the Product type
export interface Product {
  _id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discount: number;
  stockQuantity: number;
  images: (string | File)[];
  rating: number;
  reviews: string[];
  variants: Variant[];
  brand: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Define the ProductState type
interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  editProductId: string | null;
}

// Initial state
const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  isEditing: false,
  editProductId: null,
};

// Async Thunk: Fetch all products
export const getProducts = createAsyncThunk("product/getProducts", async (_, { rejectWithValue }) => {
  try {
    
    const response = await axiosInstance.get("/getProduct");
    
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
  }
});

// Async Thunk: Add a new product
export const addProduct = createAsyncThunk(
  "product/addProduct",
  async (productData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/addproduct", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to add product");
    }
  }
);

// Async Thunk: Delete a product
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      // const token = localStorage.getItem("accessToken");
      // if (!token) {
      //   return rejectWithValue("No auth token found. Please log in.");
      // }
      await axiosInstance.delete(`/products/${id}`, 
      //   {
      //   headers: { Authorization: `Bearer ${token}` },
      // }
    );
    return id
      
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to delete product");
    }
  }
);

// Async Thunk: Edit a product
export const editProduct = createAsyncThunk(
  "product/editProduct",
  async ({ id, updatedData }: { id: string; updatedData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/products/${id}`, updatedData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to update product");
    }
  }
);

// Create the slice
const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setEditing: (state, action: PayloadAction<string>) => {
      state.isEditing = true;
      state.editProductId = action.payload;
    },
    clearEditing: (state) => {
      state.isEditing = false;
      state.editProductId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        
        state.products.unshift(action.payload);
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((product) => product._id !== action.payload);
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.products = state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
        state.isEditing = false;
        state.editProductId = null;
      });
  },
});

export const { setEditing, clearEditing } = productSlice.actions;
export default productSlice.reducer;
