"use client";

import React from "react";
import { useAppSelector, useAppDispatch } from "../hook";
import { deleteProduct, setEditing } from "../features/products/productSlice"; // Adjust path as needed

const ProductList = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.product);

  const handleEdit = (id: string) => {
    dispatch(setEditing(id));
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
        Product List
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px] border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-sm sm:text-base">
                <th className="px-2 sm:px-4 py-2 border">Image</th>
                <th className="px-2 sm:px-4 py-2 border">Name & Variants</th>
                <th className="px-2 sm:px-4 py-2 border">Category</th>
                <th className="px-2 sm:px-4 py-2 border">Price</th>
                <th className="px-2 sm:px-4 py-2 border">Stock</th>
                <th className="px-2 sm:px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border text-sm sm:text-base">
                  <td className="px-2 sm:px-4 py-2 border">
                    {product.images.length > 0 ? (
                      <img
                        src={
                          typeof product.images[0] === "string"
                            ? product.images[0]
                            : URL.createObjectURL(product.images[0])
                        }
                        alt={product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">
                    <div className="font-semibold">{product.name}</div>
                    {product.variants && product.variants.length > 0 && (
                      <ul className="mt-1 text-xs sm:text-sm text-gray-600 space-y-1">
                        {product.variants.map((variant, index) => (
                          <li
                            key={index}
                            className="border p-1 rounded bg-gray-50"
                          >
                            <span className="font-medium">Size:</span>{" "}
                            {variant.size} |{" "}
                            <span className="font-medium">Color:</span>{" "}
                            {variant.color} |{" "}
                            <span className="font-medium">Stock:</span>{" "}
                            {variant.stock}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border">{product.category}</td>
                  <td className="px-2 sm:px-4 py-2 border">₹{product.price}</td>
                  <td className="px-2 sm:px-4 py-2 border">
                    {product.stockQuantity}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border flex flex-wrap gap-2">
                    <button
                      onClick={() => product._id && handleEdit(product._id)}
                      className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => product._id && handleDelete(product._id)}
                      className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;
