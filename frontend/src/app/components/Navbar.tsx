"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "../hook";
import { setSearchQuery } from "../features/products/productSlice";
import { logoutUser } from "../features/users/userSlice";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showUserPopup, setShowUserPopup] = useState(false); // State for user popup
  const [popupTimeout, setPopupTimeout] = useState<NodeJS.Timeout | null>(null); // Timeout for popup delay
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.products.searchQuery);
  const user = useAppSelector((state) => state.user.user);

  // Retrieve cart items from localStorage on component mount
  useEffect(() => {
    const cartItemsString = localStorage.getItem("cartItems");
    const cartItems = cartItemsString ? JSON.parse(cartItemsString) : [];
    setCartItemCount(cartItems.length);
  }, []);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsScrolled(currentScrollPos > 50);
      setIsNavbarVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    dispatch(logoutUser()); // Clear user data from Redux
    setShowUserPopup(false); // Close the popup
  };

  // Handle mouse enter for popup
  const handleMouseEnter = () => {
    if (popupTimeout) clearTimeout(popupTimeout); // Clear any existing timeout
    setShowUserPopup(true); // Show the popup
  };

  // Handle mouse leave for popup with delay
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowUserPopup(false); // Hide the popup after a delay
    }, 300); // 300ms delay
    setPopupTimeout(timeout); // Store the timeout
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full bg-white text-black p-4 shadow-lg z-50 transition-transform duration-300 ${
          isNavbarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center">
            <button className="md:hidden focus:outline-none" onClick={() => setIsOpen(true)}>
              <i className="fas fa-bars text-xl"></i>
            </button>
            <Link href="/">
              <Image
                src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg"
                alt="Flipkart"
                width={120}
                height={40}
                className="ml-4"
              />
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:block flex-grow max-w-lg mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products and categories"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full p-3 pl-10 pr-3 rounded-md border border-blue-900"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
            </div>
          </div>

          {/* Right: Profile/Login + Cart Icons */}
          <div className="flex items-center space-x-6">
            {/* Profile / Login */}
            <div className="relative">
              <div
                className="flex items-center space-x-2 hover:text-blue-600 transition-all cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <i className="fas fa-user text-2xl text-black border border-black p-1 rounded-full"></i>
                <span className="font-semibold text-md text-black">{user ? "You" : "Login"}</span>
              </div>

              {/* User Dropdown Menu with Arrow */}
              {showUserPopup && (
                <div
                  className="absolute right-0 mt-3 w-52 bg-white rounded-lg shadow-xl py-3 z-50 border border-gray-200 transition-opacity duration-300"
                  onMouseEnter={handleMouseEnter} // Keep popup open if mouse is over it
                  onMouseLeave={handleMouseLeave} // Close popup with delay when mouse leaves
                >
                  {/* Arrow (Triangle) */}
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>

                  {/* Menu Items */}
                  <Link
                    href={user ? "" : "https://ecommerce-myr6.onrender.com/auth/google"}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setShowLoginModal(!showLoginModal)}
                  >
                    {user ? "Welcome" : "Signup/Login"}
                  </Link>
                  <Link
                    href="/categories"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/my-cart"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cart
                  </Link>
                  <Link
                    href="/my-orders"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
                  >
                    My orders
                  </Link>
                  {user && (
                    <button
                      className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt text-gray-600"></i>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link href="/my-cart" className="relative hover:text-blue-600 transition-all">
              <i className="fas fa-shopping-cart text-2xl text-black"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Box (only visible on sm/md screens) */}
      <div
        className={`fixed w-full p-4 bg-gray-100 z-40 transition-all duration-300 lg:hidden ${
          isScrolled ? "top-0 shadow-md" : "top-16"
        }`}
      >
        <div className="relative w-full max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search for products and categories"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full p-3 pl-10 pr-3 rounded-md border border-blue-900"
          />
          <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed left-0 top-0 w-64 h-full text-black shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-50 bg-white`}
      >
        {/* Close Button */}
        <button className="absolute top-4 right-4" onClick={() => setIsOpen(false)}>
          <i className="fas fa-times text-xl text-black"></i>
        </button>

        {/* Sidebar Links */}
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <Link
              href={user ? "" : "https://ecommerce-myr6.onrender.com/auth/google"}
              className="block first:bg-sky-500 first:text-white first:rounded-md first:px-4 first:py-2 bg-white py-2 px-4 text-lg font-semibold"
              onClick={() => setShowLoginModal(!showLoginModal)}
            >
              {user ? "Welcome" : "Signup/Login"}
            </Link>
            <hr className="border-gray-300" />

            <Link
              href="/categories"
              className="block bg-white py-2 px-4 text-lg font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Categories
            </Link>
            <hr className="border-gray-300" />

            <Link
              href="/my-cart"
              className="block bg-white py-2 px-4 text-lg font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Cart
            </Link>
            <hr className="border-gray-300" />

            <Link
              href="/my-orders"
              className="block bg-white py-2 px-4 text-lg font-semibold"
              onClick={() => setIsOpen(false)}
            >
              My orders
            </Link>
            <hr className="border-gray-300" />
          </div>
        </div>
      </div>
    </>
  );
}