
"use client";

import React, { useState, useEffect } from "react";
import { addProduct, editProduct, clearEditing, getProducts } from "../features/products/productSlice"; // Adjust the import path as needed
import { RootState } from "../stores"; // Adjust the import path as needed
import { Product, Variant } from "../features/products/productSlice"; // Adjust the import path as needed
import { useAppDispatch, useAppSelector } from "../hook";
import ProductList from "../component/ProductList";
const ProductForm = () => {
  const dispatch = useAppDispatch();
  const { isEditing, editProductId, products, error } = useAppSelector((state: RootState) => state.product);


  // Find the product being edited (if in edit mode)
  const productToEdit: Product | undefined = products.find((product: Product) => product?._id === editProductId);
useEffect(()=>{
  dispatch(getProducts())
},[dispatch])
  const [product, setProduct] = useState<Product>({
  
    name: "",
    description: "",
    category: "",
    price: 0,
    discount: 0,
    stockQuantity: 0,
    images: [], // This will store File objects
    rating: 0,
    reviews: [],
    variants: [],
    brand: "",
    tags: [],
    createdAt: "",
    updatedAt: "",
    __v: 0,
  });

  const [variant, setVariant] = useState<Variant>({
    size: "",
    color: "",
    stock: 0,
    price: 0,
    
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate the form with product data if in edit mode
  useEffect(() => {
    if (isEditing && productToEdit) {
      setProduct(productToEdit);
    }
  }, [isEditing, productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariant((prev) => ({ ...prev, [name]: value }));
  };

  const addVariant = () => {
    setProduct((prev) => ({ ...prev, variants: [...prev.variants, { ...variant }] }));
    setVariant({ size: "", color: "", stock: 0, price: 0, _id: "" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files); // Get File objects
      setProduct((prev) => ({ ...prev, images: files }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const formData = new FormData();
      
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("category", product.category);
      formData.append("price", product.price.toString());
      formData.append("discount", product.discount.toString());
      formData.append("stockQuantity", product.stockQuantity.toString());
      formData.append("brand", product.brand);
      formData.append("tags", JSON.stringify(product.tags)); // Convert to string
  
      // Append images properly
      product.images.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file); // ✅ Correct way
        }
      });
      
  
      // Append variants
      formData.append("variants", JSON.stringify(product.variants));
  
      // Debug FormData
      
  
      if (isEditing) {
        dispatch(editProduct({ id: editProductId!, updatedData: formData }));
      } else {
        dispatch(addProduct(formData));
      }
  
      dispatch(clearEditing());
      alert(isEditing ? "Product updated successfully!" : "Product added successfully!");
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Failed to submit product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {isEditing ? "Edit Product" : "Create New Product"}
      </h2>
      {/* Display error message if there's an error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product description"
            rows={4}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product category"
            required
          />
        </div>

        {/* Price and Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter price"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount</label>
            <input
              type="number"
              name="discount"
              value={product.discount}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter discount"
            />
          </div>
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input
            type="number"
            name="stockQuantity"
            value={product.stockQuantity}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter stock quantity"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            name="brand"
            value={product.brand}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter brand"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={product.tags.join(",")}
            onChange={(e) => setProduct({ ...product, tags: e.target.value.split(",") })}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter tags"
          />
        </div>

        {/* Variants Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Variants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Size</label>
              <input
                type="text"
                name="size"
                value={variant.size}
                onChange={handleVariantChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter size"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="text"
                name="color"
                value={variant.color}
                onChange={handleVariantChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter color"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                name="stock"
                value={variant.stock}
                onChange={handleVariantChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter stock"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={variant.price}
                onChange={handleVariantChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Add Variant
          </button>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : isEditing ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
      {products?.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Product List</h3>
          <ProductList />
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">No products available.</p>
      )}
    </div>
  );
};

export default ProductForm;





























