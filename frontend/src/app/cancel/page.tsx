"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import React from "react";
import { useAppSelector } from "../hook";

const PaymentCancelledPage = () => {
  const router = useRouter();
const a=useAppSelector((state)=>state.order.userOrders)


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 animate-fade-in">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
        {/* Animated Cancel Icon */}
        <XCircle className="w-20 h-20 text-red-500 animate-bounce mb-4" />

        {/* Payment Failed Text */}
        <h2 className="text-2xl font-bold text-red-600">
          Payment Cancelled
        </h2>
        <p className="text-gray-600 mt-2">
          Oops! Your payment was not completed. You can try again or return to your orders.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 w-full flex flex-col space-y-3">
          <button
            className="w-full py-3 text-lg bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center"
            onClick={() => {
              
              if (Array.isArray(a) && a.length > 0) {
              
                router.push(`/payment/${a[0]._id}`);
              }
            }}
          >
            Try Again
          </button>
          <button
            className="w-full py-3 text-lg bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all flex items-center justify-center"
            onClick={() => router.push("/order")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;
