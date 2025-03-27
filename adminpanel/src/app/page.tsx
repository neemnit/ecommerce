'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white p-4 sticky top-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <Image src="/next.svg" alt="Logo" width={40} height={40} />
          My App
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✖' : '☰'}
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-lg">
          <li><Link href="/add-product" className="hover:text-gray-400">Add Product</Link></li>
          <li><Link href="/add-delivery-boy" className="hover:text-gray-400">Add Delivery Boy</Link></li>
          <li><Link href="/contact" className="hover:text-gray-400">Contact</Link></li>
          <li><button className="hover:text-gray-400">Logout</button></li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden mt-4 space-y-2 text-center bg-gray-800 p-4 rounded-lg">
          <li><Link href="/productform" className="block p-2 hover:bg-gray-700">Add Product</Link></li>
          <li><Link href="/add-delivery-boy" className="block p-2 hover:bg-gray-700">Add Delivery Boy</Link></li>
          <li><Link href="/contact" className="block p-2 hover:bg-gray-700">Contact</Link></li>
          <li><button className="block p-2 hover:bg-gray-700 w-full">Logout</button></li>
        </ul>
      )}
    </nav>
  );
}
