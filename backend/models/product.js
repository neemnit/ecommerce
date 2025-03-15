import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const variantSchema = new mongoose.Schema({
  size: { type: String },
  color: { type: String },
  stock: { type: Number, required: true },
  price: { type: Number }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stockQuantity: { type: Number, required: true },
    images: [{ type: String, required: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [reviewSchema],
    variants: [variantSchema], // Optional size & color
    brand: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
