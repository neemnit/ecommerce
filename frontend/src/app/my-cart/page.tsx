"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "../hook";
import ShowLoginModal from "../components/ShowLoginModal";

interface CartItem {
  _id: string;
  name: string;
  category: string;
  brand: string;
  images: string[];
  quantity: number;
  variant: {
    size: string;
    color: string;
    price: number;
    _id: string;
  };
}

export default function CartPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [prevPrice, setPrevPrice] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const loadCart = () => {
      const storedCart: CartItem[] = JSON.parse(localStorage.getItem("cartItems") || "[]").map((item: CartItem) => ({
        ...item,
        quantity: item.quantity || 1, 
        variant: {
          ...item.variant,
          price: item.variant?.price ?? 0,
        },
      }));

      setCartItems(storedCart);
      calculateTotals(storedCart);
    };

    loadCart();
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const handlePlaceOrder = () => {
    if (isAuthenticated) {
      router.push("/order");
    } else {
      setShowLoginModal(true);
    }
  };

  const calculateTotals = (items: CartItem[]) => {
    const newPrice = items.reduce(
      (sum, item) => sum + (item.variant?.price ?? 0) * (item.quantity ?? 1),
      0
    );

    setPrevPrice(totalPrice);
    setTotalPrice(newPrice);
    setTotalQuantity(items.reduce((sum, item) => sum + (item.quantity ?? 1), 0));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = cartItems.map((item) =>
      item._id === productId ? { ...item, quantity: newQuantity > 0 ? newQuantity : 1 } : item
    );

    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    calculateTotals(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter((item) => item._id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    calculateTotals(updatedCart);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
  };

  // Function to calculate expected delivery date
  const getExpectedDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Add 3 days

    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return deliveryDate.toLocaleDateString("en-IN", options);
  };

  return (
    <div className="container mx-auto p-4 bg-yellow-200">
      <button className="text-blue-600 mb-4 flex items-center" onClick={() => router.back()}>
        ← Back
      </button>

      <h1 className="text-2xl font-semibold mb-4">My Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link href="/" className="text-blue-600 mt-4 inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center border p-4 rounded-lg shadow-md">
                <Image src={item.images[0]} alt={item.name} width={80} height={80} className="rounded-md" />
                <div className="ml-4 flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-gray-600">₹{(item.variant.price ?? 0).toFixed(2)}</p>

                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item._id, (item.quantity ?? 1) - 1)}
                      className="bg-gray-300 text-black px-2 rounded"
                    >
                      −
                    </button>
                    <span className="mx-2 text-gray-600">{item.quantity ?? 1}</span>
                    <button
                      onClick={() => updateQuantity(item._id, (item.quantity ?? 1) + 1)}
                      className="bg-gray-300 text-black px-2 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button onClick={() => removeItem(item._id)} className="text-red-500 ml-4">
                  Remove <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="p-4 border rounded-lg shadow-md bg-gray-100">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Order Summary</h2>
            <p className="text-gray-600">Total Items: {totalQuantity}</p>

            {/* Expected Delivery Date */}
            <p className="text-green-600 font-medium mt-2">
              📦 Expected Delivery: <span className="font-bold">{getExpectedDeliveryDate()}</span>
            </p>

            {/* Animated Price Transition */}
            <div className="relative overflow-hidden h-8">
              <span
                className={`absolute text-gray-600 transition-transform duration-300 ${
                  totalPrice > prevPrice ? "animate-price-increase" : "animate-price-decrease"
                }`}
              >
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>

            {showLoginModal && <ShowLoginModal handleCloseModal={handleCloseModals} />}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full flex justify-between items-center bg-yellow-500 text-black py-2 px-4 mt-4 rounded font-bold"
            >
              <span>Place Order</span>
              <span className="text-lg font-semibold">₹{totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
