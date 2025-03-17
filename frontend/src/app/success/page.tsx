"use client"; // Required for Next.js App Router

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/hook"; // ✅ Use correct Redux hooks
import { verifyPayment } from "../features/payment/paymentSlice";
import { getUserOrder } from "../features/order/orderSlice";
import { fetchProducts } from "../features/products/productSlice";
const SuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const session_id = searchParams.get("session_id");
  const paymentId = searchParams.get("paymentId");

  const { payment, loading, error, message } = useAppSelector(
    (state) => state.payment
  );
const id =useAppSelector((state) => state.user.user?._id )


  useEffect(() => {
    const fetchData = async () => {
      if (session_id && paymentId) {
        dispatch(verifyPayment({ session_id, paymentId }));
        if (id) {
alert(id)          
           await dispatch(getUserOrder(id));
          
        }
        await dispatch(fetchProducts())
         localStorage.removeItem("cartItems");
      }
    };
    fetchData();
  }, [session_id, paymentId, dispatch,id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-green-600">Payment Status</h2>

        {loading ? (
          <p className="mt-2 text-gray-700">Processing payment...</p>
        ) : (
          <p className={`mt-2 text-gray-700 ${error ? "text-red-500" : "text-green-600"}`}>
            {error || message}
          </p>
        )}

        {payment && (
          <div className="mt-6 text-left">
            <h3 className="text-lg font-semibold text-gray-800">Order Details:</h3>
            <p className="text-gray-700">Order ID: {payment.orderId}</p>
            <p className="text-gray-700">Payment ID: {payment._id}</p>
            <p
              className={`text-gray-700 font-semibold ${
                payment.paymentStatus === "Completed" ? "text-green-600" : "text-red-500"
              }`}
            >
              Status: {payment.paymentStatus}
            </p>
          </div>
        )}

        <button
          onClick={() => router.push("/my-orders")}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to My orders
        </button>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-4 py-2 mx-4 bg-yellow-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <i className="fa-solid fa-house">return to home</i>
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
