import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix `__dirname` in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Define absolute path to uploads directory
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const productController = {
  // ✅ Create Product
  createProduct: async (req, res) => {
    try {
      // Extract fields
      const { name, description, category, price, discount, stockQuantity, brand } = req.body;

      // ✅ Parse `tags` and `variants`
      let tags = [];
      let variants = [];

      try {
        tags = req.body.tags ? JSON.parse(req.body.tags) : [];
        variants = req.body.variants ? JSON.parse(req.body.variants) : [];
      } catch (error) {
        return res.status(400).json({ error: "Invalid JSON format in tags or variants." });
      }

      // ✅ Validate `tags` and `variants`
      if (!Array.isArray(tags)) return res.status(400).json({ error: "Tags must be an array." });
      if (!Array.isArray(variants)) return res.status(400).json({ error: "Variants must be an array." });

      // Validate image upload
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Please upload at least one image." });
      }

      // ✅ Upload images to Cloudinary
      const imageUploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "products" })
      );
      const uploadedImages = await Promise.all(imageUploadPromises);
      const imageUrls = uploadedImages.map((img) => img.secure_url);

      // ✅ Delete uploaded images from local storage
      req.files.forEach((file) => {
        const filePath = path.join(UPLOADS_DIR, file.filename);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`❌ Error deleting file ${filePath}:`, err.message);
          } else {
            console.log(`✅ Deleted file: ${filePath}`);
          }
        });
      });

      // Create new product
      const newProduct = new Product({
        name,
        description,
        category,
        price,
        discount,
        stockQuantity,
        brand,
        tags,
        variants,
        images: imageUrls,
      });

      await newProduct.save();

      // Emit socket event to notify all connected clients
      const io = req.app.get("io");  // Get the io instance from Express
      if (io) io.emit("product_added", newProduct);

      res.status(201).json({ message: "Product created successfully", data: newProduct });
    } catch (error) {
      console.error("❌ Error creating product:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ Get All Products
  getProduct: async (req, res) => {
    try {
      const productData = await Product.find({});
      if (!productData || productData.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
      res.status(200).json({ success: true, data: productData });
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },

  // ✅ Delete Product
  deleteProduct: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Emit socket event to notify all connected clients about product deletion
      const io = req.app.get("io");  // Get the io instance from Express
      if (io) io.emit("product_deleted", id);

      res.json({ message: "Product deleted successfully", id });
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default productController;
