import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const { state } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-organic-700">FOORGANICS</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/products" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">
              Products
            </Link>
            <Link to="/about" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-earth-700 hover:text-organic-600 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/labadmin" className="text-earth-700 hover:text-organic-600 transition-colors p-2">
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
            <Link to="/cart" className="relative text-earth-700 hover:text-organic-600 transition-colors p-2">
              <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-organic-600 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-earth-700 hover:text-organic-600 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-earth-100">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-earth-700 hover:text-organic-600 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-earth-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-earth-700 hover:text-organic-600 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-earth-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/about" 
                className="text-earth-700 hover:text-organic-600 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-earth-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-earth-700 hover:text-organic-600 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-earth-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
