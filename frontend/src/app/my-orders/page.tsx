"use client";

import React from "react";
import { useAppSelector } from "../hook";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle, XCircle, Truck, ArrowLeft } from "lucide-react";
import { Order } from "../features/order/orderSlice";

const OrderHistory = () => {
  const orders: Order[] = useAppSelector((state) => state.order.userOrders);
  const router = useRouter();
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back
      </button>
      <h2 className="text-2xl font-semibold mb-6">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 shadow-md rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Order ID: {order._id}</h3>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    order.orderStatus === "Completed"
                      ? "bg-green-100 text-green-600"
                      : order.orderStatus === "Pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-gray-700 font-medium">Products:</h4>
                  {order.products.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3 mt-2">
                      <Image
                        src={item.productId?.images?.[0] || "/placeholder.png"}
                        alt={item.productId?.name || "Product Image"}
                        width={64}
                        height={64}
                        className="rounded-md"
                      />
                      <div>
                        <p className="font-medium">{item.productId?.name || "Unknown Product"}</p>
                        <p className="text-sm text-gray-500">
                          {item.variant?.size || "N/A"} / {item.variant?.color || "N/A"}
                        </p>
                        <p className="text-sm text-gray-700">₹{item.price || 0} x {item.quantity || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-gray-700 font-medium">Shipping Address:</h4>
                  <p className="text-sm text-gray-500">
                    {typeof order.shippingAddressId === 'object' 
                      ? `${order.shippingAddressId.city || "Unknown City"}, ${order.shippingAddressId.state || "Unknown State"}`
                      : "Address not available"
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">Total: ₹{order.totalAmount || 0}</p>
                  <p
                    className={`flex items-center justify-end mt-2 text-sm font-medium ${
                      order.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {order.paymentStatus === "Paid" ? (
                      <CheckCircle className="w-5 h-5 mr-1" />
                    ) : (
                      <XCircle className="w-5 h-5 mr-1" />
                    )}
                    {order.paymentStatus || "Payment status unknown"}
                  </p>
                  <p className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    Ordered on: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "Unknown date"}
                  </p>
                  <p className="flex items-center text-sm text-gray-500 mt-2">
                    <Truck className="w-4 h-4 mr-1" />
                    Delivery by: {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "Unknown Date"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;