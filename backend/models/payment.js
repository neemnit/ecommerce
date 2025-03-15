import mongoose from 'mongoose';
import * as yup from 'yup';

// 🏦 Payment Schema
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // ⬅️ References the 'Order' collection
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery'],
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Ensures uniqueness but allows null values
    },
  },
  { timestamps: true }
);

// ✅ Payment Validation Schema using Yup
const paymentValidationSchema = yup.object().shape({
  orderId: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID') // ⬅️ Ensures valid MongoDB ObjectId
    .required('Order ID is required'),
  paymentMethod: yup
    .string()
    .oneOf(['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery'], 'Invalid payment method')
    .required('Payment method is required'),
  paymentStatus: yup
    .string()
    .oneOf(['Pending', 'Completed', 'Failed', 'Refunded'], 'Invalid payment status')
    .default('Pending'),
  transactionId: yup.string().nullable(),
});

// 📌 Define the Payment model
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export { Payment, paymentValidationSchema };
