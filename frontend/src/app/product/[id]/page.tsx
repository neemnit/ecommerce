
"use client";
import ShowLoginModal from "@/app/components/ShowLoginModal";
import { fetchProducts, Product, Variant } from "@/app/features/products/productSlice";
import { useAppDispatch, useAppSelector } from "@/app/hook";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CartItem {
  _id: string;
  name: string;
  category: string;
  brand: string;
  images: string[];
  quantity: number;
  variant: {
    size: string;
    color: string;
    price: number;
    _id: string;
  };
}

const Page = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const router = useRouter();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAddClick, setIsAddClick] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Variant | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: "50%", y: "50%" });
  const [isInCart, setIsInCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchProducts());
    };
    fetchData();
  }, [dispatch]);

  const address = useAppSelector((state) => state.address.addresses);
  const { products, loading, error } = useAppSelector((state) => state.products);
  const product = products.find((p: Product) => p._id === id);
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (product) {
      const cartItems: Product[] = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const existingItem = cartItems.find((item: Product) => item._id === product._id);
      setIsInCart(!!existingItem);
    }
  }, [product]);

  if (loading) return <div className="text-center py-10 text-xl">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-10 text-gray-500">Product not found</div>;

  const images = product?.images || [];

  const handlePrev = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x: `${x}%`, y: `${y}%` });
  };

  const handleBuyClick = () => {
    setShowSizeModal(true);
  };

  const handleCloseModals = () => {
    setShowSizeModal(false);
    setShowLoginModal(false);
  };

  const handleContinueClick = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    if (isAddClick) {
      addToCart(); // Call addToCart only when continuing from size modal for "Add to Cart"
    } else {
      // For "Buy Now", store the item temporarily in localStorage
      if (product) {
        const tempCartItem: CartItem = {
          _id: product._id,
          name: product.name,
          category: product.category,
          brand: product.brand,
          images: product.images,
          quantity: 1,
          variant: {
            size: selectedSize.size,
            color: selectedSize.color,
            price: selectedSize.price,
            _id: selectedSize._id,
          },
        };
      
        localStorage.setItem("tempCartItem", JSON.stringify(tempCartItem));
      }

      // Proceed to the next step (address or order page)
      if (address.find((add) => add.userId === user?._id)) {
        router.push("/order");
      } else if (user) {
        router.push("/address");
      } else {
        setShowLoginModal(true);
      }
    }
    setShowSizeModal(false);
  };

  const addToCart = () => {
    if (!product) {
      console.error("Product data is missing.");
      return;
    }

    const cartItems: CartItem[] = JSON.parse(localStorage.getItem("cartItems") || "[]");

    // Find selected variant based on size
    const selectedVariant = selectedSize
      ? product.variants?.find((variant) => variant.size === selectedSize.size)
      : null;

    if (!selectedVariant) {
      alert("Selected size is not available.");
      return;
    }

    // Check if the same product with the selected size exists in the cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item._id === product._id && selectedSize && item.variant.size === selectedSize.size
    );

    if (existingItemIndex !== -1) {
      // Increase quantity if item already exists
      cartItems[existingItemIndex].quantity += 1;
    } else {
      // Add new item with only relevant details
      const newItem: CartItem = {
        _id: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        images: product.images,
        quantity: 1,
        variant: {
          size: selectedVariant.size,
          color: selectedVariant.color,
          price: selectedVariant.price,
          _id: selectedVariant._id,
        },
      };

      cartItems.push(newItem);
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    setIsInCart(true);
    setShowNotification(true);
    setIsAddClick(false);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAddToCart = () => {
    setShowSizeModal(true);
    setIsAddClick(true);
  };

  const handleGoToCart = () => {
    router.push("/my-cart");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-700 hover:text-gray-900 mb-4"
      >
        <span className="text-xl">←</span> <span className="ml-2">Back</span>
      </button>

      {showSizeModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-end sm:items-center">
          <div className="bg-white w-full sm:w-96 p-4 rounded-t-lg sm:rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
              onClick={() => setShowSizeModal(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-3">Select Size</h2>

            <div className="flex items-center gap-4">
              {/* Product Image */}
              <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />

              <div className="grid grid-cols-3 gap-2 flex-1">
  {product?.variants.map((variant) => (
    <button
      key={variant._id}
      className={`p-2 border-2 rounded-full flex flex-col items-center 
        ${
          selectedSize?._id === variant._id
            ? "bg-blue-800 text-white" // Selected style
            : variant.stock === 0
            ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" // Out of stock style
            : "border-gray-300 bg-gray-200 text-black" // Default style
        }`}
      onClick={() => variant.stock !== 0 && setSelectedSize(variant)}
      disabled={variant.stock === 0}
    >
      <span
        className={`text-sm font-medium ${
          variant.stock === 0 ? "line-through" : ""
        }`}
      >
        {variant.size}
      </span>
      <span
        className={`text-xs ${
          variant.stock === 0 ? "line-through" : ""
        }`}
      >
        ₹{variant.price}
      </span>
    </button>
  ))}
</div>
            </div>

            <button
              className={`mt-4 w-full py-2 rounded-md text-black ${selectedSize ? "bg-yellow-500" : "bg-gray-400 cursor-not-allowed"}`}
              onClick={handleContinueClick}
              disabled={!selectedSize}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {showLoginModal && <ShowLoginModal handleCloseModal={handleCloseModals} />}

      {showNotification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-500">
          Product added to cart!
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {images.length > 0 ? (
          <div className="lg:w-1/2 lg:sticky lg:top-20 lg:self-start">
            <div className="relative">
              <div
                className="w-full h-96 rounded-lg bg-no-repeat bg-cover transition-transform duration-300"
                style={{
                  backgroundImage: `url(${images[currentImage]})`,
                  backgroundPosition: `${zoomPosition.x} ${zoomPosition.y}`,
                  backgroundSize: "200%",
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomPosition({ x: "50%", y: "50%" })}
              />
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600"
              >
                ❮
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600"
              >
                ❯
              </button>
            </div>
            <div className="flex justify-center mt-3 gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`h-3 w-3 rounded-full ${currentImage === index ? "bg-gray-900" : "bg-gray-400"}`}
                ></button>
              ))}
            </div>
            <div className="hidden lg:flex gap-4 mt-6">
              <button
                onClick={isInCart ? handleGoToCart : handleAddToCart}
                className="w-full bg-white text-black border border-gray-400 px-6 py-2 rounded-md text-lg shadow-md hover:bg-gray-100"
              >
                {isInCart ? "Go to Cart" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyClick}
                className="w-full bg-yellow-500 text-black text-semibold px-6 py-2 rounded-md text-lg shadow-md hover:bg-yellow-600"
              >
                Buy Now
              </button>
            </div>
          </div>
        ) : (
          <p className="lg:w-1/2 text-gray-500 text-center">No images available</p>
        )}
        <div className="lg:w-1/2 space-y-4">
          <p className="text-lg text-gray-700">{product.description}</p>
          <p className="text-2xl font-semibold text-red-600">₹{product.price}</p>
          <div className="flex gap-4 lg:hidden">
            <button
              onClick={isInCart ? handleGoToCart : handleAddToCart}
              className="w-full bg-white text-black border border-gray-400 px-6 py-2 rounded-md text-lg shadow-md hover:bg-gray-100"
            >
              {isInCart ? "Go to Cart" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyClick}
              className="w-full bg-yellow-500 text-black text-bold px-6 py-2 rounded-md text-lg shadow-md hover:bg-yellow-600"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;