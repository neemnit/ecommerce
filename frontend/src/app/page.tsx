"use client";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "./hook";
import { fetchProducts } from "./features/products/productSlice";
import { useEffect } from "react";
import { Product } from "./features/products/productSlice";
import { useRouter } from "next/navigation";
import { fetchUserById, setUser } from "./features/users/userSlice";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Define the expected structure of the decoded JWT
export interface DecodedToken {
  id: string;
  name: string;
  email: string;
  exp: number;
}

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, products, error, searchQuery } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const checkAuth = async () => {
      // if (typeof window === "undefined") return; // Prevents SSR issues

      let token: string | null = localStorage.getItem("accessToken");
      
      if (!token) return;

      try {
        const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
        

        if (decoded.exp * 1000 < Date.now()) {
          // Refresh token
          const res = await axios.post("https://ecommerce-myr6.onrender.com/refresh-token", {}, { withCredentials: true });
          localStorage.setItem("accessToken", res.data.accessToken);
          token = res.data.accessToken;
        }
           if(token){
            
            dispatch(fetchUserById(decoded.id));
        dispatch(setUser(jwtDecode<DecodedToken>(token)));
            } // Update Redux store with user data
      } catch (error) {
        console.error("Token verification failed", error);
        localStorage.removeItem("accessToken");
      }
    };

    checkAuth();
  }, []);

  const filteredProducts = products.filter((product: Product) =>
    searchQuery ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );


  return (
    <div className="min-h-screen p-6 sm:p-10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-white mb-8">
        Featured Products
      </h1>

      {loading && <p className="text-center text-lg text-blue-400">Loading...</p>}
      {error && <p className="text-center text-lg text-red-400">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: Product) => (
            <div
              key={product._id}
              onClick={() => router.push(`/product/${product._id}`)}
              className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-4 transition-transform transform hover:scale-105 hover:shadow-2xl cursor-pointer border border-gray-700"
            >
              <Image
                src={product.images?.[0] ?? "/placeholder.jpg"}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-md"
              />
              <h2 className="text-lg font-semibold mt-3 text-white">{product.name}</h2>
              <p className="text-gray-300 text-sm mt-1">{product.description}</p>
              <p className="text-green-400 font-bold mt-2 text-lg">₹{product.price}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-lg text-red-400">No products found</p>
        )}
      </div>
    </div>
  );
}
