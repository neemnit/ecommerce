
import Order from "../models/order.js";
import Product from "../models/product.js";
import Address from "../models/address.js";
import User from "../models/user.js";
const orderController = {
  // Create Order
  createOrder: async (req, res) => {
    
    try {
      const { userId, products, totalAmount, shippingAddressId } = req.body;
  
      // Validate Product Prices based on selected variant (size & color)
      let calculatedTotal = 0;
  
      for (const item of products) {
        const product = await Product.findById(item.productId);
        
  
        if (!product) {
          return res.status(404).json({ error: `Product ${item.productId} not found` });
        }
  
        // Check if the product has variants and match based on size & color
        const selectedVariant = product.variants.find(
          (variant) => variant.size === item.variant.size && variant.color === item.variant.color
        );
  
        if (!selectedVariant) {
          return res.status(400).json({
            error: `Variant (Size: ${item.variant.size}, Color: ${item.variant.color}) not found for product ${product.name}`,
          });
        }
  
        // Validate price from selected variant
        if (selectedVariant.price !== item.price) {
          return res.status(400).json({
            error: `Price mismatch for product ${product.name} (Size: ${item.variant.size}, Color: ${item.variant.color}). Expected ₹${selectedVariant.price}, got ₹${item.price}`,
          });
        }
  
        calculatedTotal += selectedVariant.price * item.quantity;
      }
  
      if (calculatedTotal !== totalAmount) {
        return res.status(400).json({ error: "Total amount mismatch" });
      }
  
      // Create Order
      const newOrder = new Order({
        userId,
        products,
        totalAmount,
        shippingAddressId,
        paymentStatus: "Pending",
        orderStatus: "Processing",
        orderDate: new Date(),
        deliveryDate: new Date(new Date().setDate(new Date().getDate() + 4)), // 4-day delivery
      });
  
      const savedOrder = await newOrder.save();
  
      // Update Address with Order ID
      await Address.findByIdAndUpdate(
        shippingAddressId,
        { $push: { orderId: savedOrder._id } },
        { new: true }
      );
  
      // Update User with the latest shipping address
      await User.findByIdAndUpdate(
        userId,
        { $set: { address: shippingAddressId } },
        { new: true }
      );
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        orderId: savedOrder._id,
        redirectUrl: `http://localhost:3000/payment/${savedOrder._id}`,
      });
      

      // Redirect to Payment Page with orderId
      
  
    } catch (error) {
      console.error("Order creation failed:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  
  
  

  // Get Orders by User ID
  getUserOrder: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const orders = await Order.find({ userId })
        .sort({ orderDate: -1 })
        .populate({
          path: "products.productId",
          select: "name description category price discount stockQuantity images variants brand tags"
        })
        .populate({
          path: "shippingAddressId",
          select: "address city state country postalCode"
        });

      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  }
,

  // Get Single Order by ID
  getOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId)
        .populate("userId", "name email") // Populate user details
        .populate("shippingAddressId") // Populate shipping address
        .lean();

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error("❌ Failed to fetch order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  },

  // Update Order Status
   updateOrderStatus:async(req, res)=> {
    try {
      const { orderId } = req.params;
      const { orderStatus } = req.body;
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus },
        { new: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  },
};

export default orderController;
