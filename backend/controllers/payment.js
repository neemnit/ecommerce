import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import { Payment, paymentValidationSchema } from "../models/payment.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import User from '../models/user.js';
import Address from "../models/address.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentController = {
  /**
   * Step 1: Create Payment Entry and Redirect to Handle Payment
   */
  createPayment: async (req, res) => {
    try {
      await paymentValidationSchema.validate(req.body, { abortEarly: false });
      const { orderId, paymentMethod } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // Create a new payment record
      const payment = new Payment({ orderId, paymentMethod, paymentStatus: "Pending" });
      await payment.save();

      res.status(200).json({
        success: true,
        paymentId: payment._id, // Use `_id` instead of `paymentId`
        redirectUrl: `${process.env.CLIENT_URL}/payments/${payment._id}`, // Updated
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  },

  /**
   * Step 2: Handle Payment (Redirect to Stripe Checkout)
   */
  handlePayment: async (req, res) => {
    try {
      
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        const order = await Order.findById(payment.orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        const image=await Order.findById(order._id).populate('products.productId','image')
        

        // Fetch customer's saved address from the database
       
        // If no saved address, set default empty values
        

        // Generate line items for Stripe checkout
        const line_items = order.products.map(({ name, quantity, price, variant, image }) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name,
                    description: `Size: ${variant?.size || "N/A"}, Color: ${variant?.color || "N/A"}`,
                   images: image ? [image] : ["https://res.cloudinary.com/dadqjtf9r/image/upload/v1742006266/products/default.jpg"]
                },
                unit_amount: Math.round(price * 100),
            },
            quantity,
        }));

        // Create Stripe checkout session with pre-filled address
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          customer_email: req.user.email, // Track the customer
          billing_address_collection: "auto", // Collect billing address automatically
          shipping_address_collection: {
              allowed_countries: ["IN"], // Allow shipping only within India
          },
          line_items,
          mode: "payment",
          success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&paymentId=${paymentId}`,
          cancel_url: `${process.env.CLIENT_URL}/cancel`,
      });
      

        // Save transaction ID in the database
        payment.transactionId = session.id;
        await payment.save();

        res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ success: false, message: "Payment processing failed", error: error.message });
    }
},

// ✅ Save Address in Database After Payment Success
saveCustomerAddress: async (req, res) => {
  try {
      const { sessionId } = req.body;

      // Retrieve the Stripe checkout session to get customer details
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["customer_details"],
      });

      const customerDetails = session.customer_details;

      let customerAddress = await Address.findOne({ userId: req.user._id });

      if (!customerAddress) {
          customerAddress = new Address({
              userId: req.user._id,
              line1: customerDetails.address.line1 || "",
              line2: customerDetails.address.line2 || "",
              city: customerDetails.address.city || "",
              state: customerDetails.address.state || "",
              postal_code: customerDetails.address.postal_code || "",
              country: customerDetails.address.country || "",
          });
      } else {
          customerAddress.line1 = customerDetails.address.line1 || "";
          customerAddress.line2 = customerDetails.address.line2 || "";
          customerAddress.city = customerDetails.address.city || "";
          customerAddress.state = customerDetails.address.state || "";
          customerAddress.postal_code = customerDetails.address.postal_code || "";
          customerAddress.country = customerDetails.address.country || "";
      }

      await customerAddress.save();
      res.status(200).json({ success: true, message: "Customer address saved successfully" });
  } catch (error) {
      console.error("Save Address Error:", error);
      res.status(500).json({ success: false, message: "Failed to save address", error: error.message });
  }
}

,



  /**
   * Step 3: Handle Payment Success
   */
  /**
 * Step 3: Handle Payment Success
 */
/**
 * Step 3: Handle Payment Success
 */
handleSuccess: async (req, res) => {
  try {
    const { session_id, paymentId } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }

    if (!paymentId || paymentId.length !== 24) {
      return res.status(400).json({ success: false, message: "Invalid Payment ID" });
    }

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Fetch payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    // If payment is already completed, do nothing
    if (payment.paymentStatus === "Completed") {
      return res.status(200).json({ success: true, message: "Payment already processed", payment });
    }

    // Fetch order details
    const order = await Order.findById(payment.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // If order is already completed, do nothing
    if (order.orderStatus === "Completed") {
      return res.status(200).json({ success: true, message: "Order already processed", order });
    }

    // Deduct product quantities from stock
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        if (product.stockQuantity >= item.quantity) {
          product.stockQuantity -= item.quantity; // Reduce stock

          for (const k of product.variants) {
            if (k.size === item.variant.size && k.color === item.variant.color) {
              k.stock = Number(k.stock) || 0;
              const quantityToReduce = Number(item.quantity) || 0;
              if (quantityToReduce > 0 && k.stock >= quantityToReduce) {
                k.stock -= quantityToReduce;
              }
            }
          }
        }
        product.updatedAt = new Date();
        await product.save();
      }
    }

    // Update payment status
    payment.paymentStatus = "Completed";
    await payment.save();

    // Update order status
    order.orderStatus = "Completed";
    order.paymentStatus="Paid"
    await order.save();

    // Update user order history
    const user = await User.findById(order.userId);
    if (user && !user.orderHistory.includes(order._id)) {
      user.orderHistory.push(order._id);
      await user.save();
    }

    res.status(200).json({ success: true, message: "Payment successful", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}





};

export default paymentController;
