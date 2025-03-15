import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.js";

const productController = {
  createProduct: async (req, res) => {
    try {
      

      // Extract other fields
      const { name, description, category, price, discount, stockQuantity, brand } = req.body;

      // ✅ Parse `tags` and `variants` safely (Fix for form-data issue)
      let tags = [];
      let variants = [];

      try {
        tags = req.body.tags ? JSON.parse(req.body.tags) : [];
        variants = req.body.variants ? JSON.parse(req.body.variants) : [];
      } catch (error) {
        return res.status(400).json({ error: "Invalid JSON format in tags or variants." });
      }

      // ✅ Ensure `tags` and `variants` are valid arrays
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: "Tags must be an array." });
      }
      if (!Array.isArray(variants)) {
        return res.status(400).json({ error: "Variants must be an array." });
      }

      // Validate image upload
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Please upload at least one image." });
      }

      // Upload images to Cloudinary
      const imageUploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "products" })
      );
      const uploadedImages = await Promise.all(imageUploadPromises);
      const imageUrls = uploadedImages.map((img) => img.secure_url);

      // Create new product
      const newProduct = new Product({
        name,
        description,
        category,
        price,
        discount,
        stockQuantity,
        brand,
        tags, // ✅ Now properly parsed as an array
        variants, // ✅ Now properly parsed as an array
        images: imageUrls,
      });

      await newProduct.save();
      res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getProduct: async (req, res) => {
    try {
        const productData = await Product.find({});
        if (!productData || productData.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        res.status(200).json({ success: true, data: productData });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

};

export default productController;
