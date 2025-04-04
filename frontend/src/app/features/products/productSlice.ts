import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "@/app/config/axios";

export type Variant = {
  size: string;
  color: string;
  stock: number;
  price: number;
  _id: string;
};
export type Product = {
  _id: string;
  brand: string;
  category: string;
  createdAt: string;
  description: string;
  discount: number;
  images: string[];
  name: string;
  price: number;
  rating: number;
  reviews: unknown[]; // You can define a more specific type for reviews if needed
  stockQuantity: number;
  tags: string[];
  updatedAt: string;
  variants: Variant[];
  quantity?: number;
  __v: number;
};

type InitialState = {
  loading: boolean;
  products: Product[];
  error: string;
  searchQuery: string;
};

const initialState: InitialState = {
  loading: false,
  products: [],
  error: "",
  searchQuery: "",
};

// Fetch products asynchronously with proper error handling
export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/getproduct");
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
      }
      return rejectWithValue("Something went wrong while fetching products");
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      // Add new product to the list
      state.products.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
      state.loading = false;
      state.products = action.payload;
      state.error = "";
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.error = action.payload ?? "Failed to load products";
    });
  },
});

export const { setSearchQuery, addProduct } = productSlice.actions;
export default productSlice.reducer;
