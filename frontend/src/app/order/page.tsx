"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../hook";
import { getAddress, Address } from "../features/address/addressSlice";
import { createOrder, Order } from "../features/order/orderSlice";
import { Variant } from "../features/products/productSlice";
import { setEditing } from "../features/address/addressSlice";

// Product interface
interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  images: string[];
  quantity: number;
  variant: Variant;
}

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const { error, loading, addresses } = useAppSelector((state) => state.address);
  const user = useAppSelector((state) => state.user);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cart and address on mount
  useEffect(() => {
    // Load regular cart items
    const storedCart: Product[] = JSON.parse(localStorage.getItem("cartItems") || "[]");

    // Load temporary cart item (for "Buy Now")
    const tempCartItem: Product | null = JSON.parse(localStorage.getItem("tempCartItem") ?? "null");

    // Combine regular cart items and temporary cart item
    const combinedCart = tempCartItem ? [tempCartItem, ...storedCart] : storedCart;

    setCartItems(combinedCart);

    // Clear the temporary cart item after use
    

    dispatch(getAddress());
  }, [dispatch]);

  // Set default address when available
  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses]);

  // Update quantity in cart
  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = cartItems.map((item) =>
      item._id === productId ? { ...item, quantity: Math.max(newQuantity, 1) } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  // Proceed to Payment
  const handleProceedToPayment = async () => {
    if (!user?.user) {
      alert("Please log in to proceed.");
      return;
    }

    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    const orderId = `ORD-${Date.now()}`;
    const orderDate = new Date().toISOString();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Set delivery date to 3 days from now

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    const orderDetails: Order = {
      orderId,
      userId: user.user?._id || user.user?.id || "",
      products: cartItems.map((item) => ({
        productId: {
          _id: item._id,
          name: item.name,
          description: item.category,
          category: item.category,
          price: item.variant.price,
          images: item.images,
        },
        name: item.name,
        quantity: item.quantity,
        price: item.variant.price,
        variant: {
          size: item.variant.size,
          color: item.variant.color,
        },
      })),
      totalAmount,
      paymentStatus: "Pending",
      orderStatus: "Processing",
      orderDate,
      deliveryDate: deliveryDate.toISOString(),
      shippingAddressId: selectedAddress._id,
    };

    try {
      const response = await dispatch(createOrder(orderDetails)).unwrap();
      if (response.success) {
        router.push(response.redirectUrl);
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert(error || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExpectedDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Add 3 days

    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return deliveryDate.toLocaleDateString("en-IN", options);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Back Button */}
      <button className="text-blue-600 flex items-center mb-4" onClick={() => router.back()}>
        ← Back
      </button>

      {/* Address Section */}
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="p-4 border flex justify-between items-center rounded-lg shadow-md bg-gray-100 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Delivery to:</h2>
          {selectedAddress && (
            <p className="text-gray-700">
              {selectedAddress.fullName}, {selectedAddress.city}, {selectedAddress.state}{" "}
              {selectedAddress.phone}
            </p>
          )}
          <button
            className="text-blue-600 mt-2"
            onClick={() => {
              if (selectedAddress) {
                const addressId = selectedAddress._id || "";
                dispatch(setEditing(addressId)); // Pass the address ID
              }
              router.push("/address");
            }}
          >
            Change
          </button>
        </div>
      )}

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link href="/" className="text-blue-600 mt-4 inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center border p-4 rounded-lg shadow-md">
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md"
                />
                <div className="ml-4 flex-1">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">₹{item.variant.price.toFixed(2)}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="bg-gray-300 text-black px-2 rounded"
                    >
                      −
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="bg-gray-300 text-black px-2 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="p-4 border rounded-lg shadow-md bg-gray-100">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Order Summary</h2>
            <p className="text-gray-600">Total Items: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p className="text-green-600 font-medium mt-2">
              📦 Expected Delivery: <span className="font-bold">{getExpectedDeliveryDate()}</span>
            </p>
            <p className="text-lg font-bold text-gray-500">
              Total: ₹
              {cartItems
                .reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
                .toFixed(2)}
            </p>
            <button
              onClick={handleProceedToPayment}
              className={`w-full py-2 px-4 mt-4 rounded font-bold ${isSubmitting
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-black"
                }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}