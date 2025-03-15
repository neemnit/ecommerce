import * as Yup from "yup";
import Product from "../models/product.js"; // Import the Product model

const productValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Product name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters"),

  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),

  category: Yup.string()
    .required("Category is required")
    .min(3, "Category must be at least 3 characters"),

  price: Yup.number()
    .required("Price is required")
    .positive("Price must be a positive number"),

  discount: Yup.number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),

  stockQuantity: Yup.number()
    .required("Stock quantity is required")
    .integer("Stock must be an integer")
    .min(0, "Stock cannot be negative"),

  images: Yup.array()
    .of(Yup.string().url("Invalid image URL"))
    .min(1, "At least one image URL is required"),

  rating: Yup.number()
    .min(0, "Rating cannot be negative")
    .max(5, "Rating cannot exceed 5"),

  brand: Yup.string().optional(),
});

// Middleware function to validate request body
export const validateProduct = async (req, res, next) => {
  try {
    await productValidationSchema.validate(req.body, { abortEarly: false });
    next(); // Proceed if everything is valid
  } catch (error) {
    res.status(400).json({ errors: error.errors });
  }
};
