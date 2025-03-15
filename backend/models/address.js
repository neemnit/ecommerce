import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    }],
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    phone: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/, // Validates 10-digit Indian phone numbers
    },
    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/, // Ensures exactly 6 digits
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    houseNo: {
      type: String,
      required: true,
      trim: true,
    },
    road: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    trackingNumber: {
      type: String,
      trim: true,
      unique: true, // Ensures no duplicate tracking numbers
      sparse: true, // Allows null values
    },
  },
  { timestamps: true }
);

const Address = mongoose.model('Address', addressSchema);

export default Address;
