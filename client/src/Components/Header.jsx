// components/Header.jsx
import React, { useState } from 'react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">SheyRooms</h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-primary font-medium">Stays</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium">Deals</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium">Host your property</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium">Support</a>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <select className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary">
              <option>EN</option>
              <option>ES</option>
              <option>FR</option>
            </select>
            <select className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary">
              <option>USD</option>
              <option>EUR</option>
              <option>INR</option>
            </select>
            <button className="text-gray-700 hover:text-primary font-medium">Sign in</button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
              List your property
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className="fas fa-bars text-gray-700"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
