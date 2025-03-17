"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../hook";
import { fetchOrder } from "../../features/order/orderSlice";
import { createPayment, Payment } from "../../features/payment/paymentSlice"; // ✅ Import createPayment thunk
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import axiosInstance from "@/app/config/axios";

const PaymentPage = () => {
  const router = useRouter();
  const { id } = useParams(); // ✅ Get orderId from URL
  const dispatch = useAppDispatch();

  const order = useAppSelector((state) => state.order.order);
  const paymentStatus = useAppSelector((state) => state.payment.payment?.paymentStatus);

  const [showDetails, setShowDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Prevent multiple clicks
  const [redirecting, setRedirecting] = useState(false); // ✅ Manage redirect animation

  // ✅ Fetch order details
  useEffect(() => {
    const fetchOrderById=async()=>{
      if (id) {
        await dispatch(fetchOrder(id as string));
      }
    }
    fetchOrderById()
    localStorage.removeItem("tempCartItem")
    
  }, [id, dispatch]);

  const handlePay = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (!order) {
      alert("Order not found. Please try again.");
      return;
    }

    const paymentData = {
      orderId: id, // ✅ Use orderId from URL
      paymentMethod,
      paymentStatus: "Pending",
      transactionId: null,
    };

    try {
      setLoading(true); // ✅ Start loading
      const paymentResponse = await dispatch(createPayment(paymentData as Payment));

      if (createPayment.fulfilled.match(paymentResponse)) {
        const paymentId = paymentResponse.payload.paymentId || paymentResponse.payload._id; // ✅ Extract paymentId correctly

        if (paymentId) {
          setRedirecting(true); // ✅ Show redirect animation
          const { data } = await axiosInstance.get(`/payments/${paymentId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });

          if (data.success && data.url) {
            window.location.href = data.url; // ✅ Redirect to Stripe Checkout
          } else {
            setRedirecting(false);
            alert("Failed to get Stripe checkout URL.");
          }
        } else {
          alert("Payment ID not received.");
        }
      } else {
        alert("Payment creation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error redirecting to Stripe:", error);
      alert("Error processing payment.");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-black transition"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg relative">
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
          Order Summary
        </h2>

        {/* Order Summary with Dropdown */}
        <div
          className="flex justify-between text-lg font-medium text-gray-800 cursor-pointer items-center"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>Total Amount:</span>
          <span className="flex items-center">
            ₹{order?.totalAmount}{" "}
            {showDetails ? (
              <ChevronUp className="w-5 h-5 ml-2 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-5 h-5 ml-2 transition-transform duration-300" />
            )}
          </span>
        </div>

        {/* Smooth Transition for Order Details */}
        <div
          className={`mt-2 bg-gray-200 rounded-lg p-2 transition-all duration-300 overflow-hidden ${
            showDetails ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {order?.products?.map((product, index) => (
            <p key={index} className="py-1">
              {product.name} - {product.quantity} x ₹{product.price}
            </p>
          ))}
        </div>

        {/* Payment Method Selection */}
        <select
          className="w-full mt-4 p-2 border rounded-lg placeholder:text-gray-600"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Select Payment Method</option>
          <option className="placeholder:text-gray-600" value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
         
          
        </select>

        {/* Payment Button */}
        <button
          className="w-full mt-6 text-lg py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black rounded-lg hover:opacity-90 transition flex items-center justify-center"
          onClick={handlePay}
          disabled={loading || paymentStatus === "Pending"}
        >
          {redirecting ? (
            <span className="flex items-center space-x-2">
              <span className="animate-pulse">Redirecting to Stripe</span>
              <span className="flex space-x-1">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-400"></span>
              </span>
            </span>
          ) : (
            `Pay ₹${order?.totalAmount}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
