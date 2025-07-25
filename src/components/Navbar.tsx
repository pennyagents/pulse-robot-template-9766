
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, Grid3X3, Search, Shield, Menu, X } from 'lucide-react';
import UtilitiesDropdown from '@/components/UtilitiesDropdown';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home, color: 'text-blue-600 hover:text-blue-700' },
    { path: '/about', label: 'About Project', icon: Info, color: 'text-green-600 hover:text-green-700' },
    { path: '/categories', label: 'Categories', icon: Grid3X3, color: 'text-purple-600 hover:text-purple-700' },
    { path: '/status', label: 'Check Status', icon: Search, color: 'text-orange-600 hover:text-orange-700' },
    { path: '/admin/login', label: 'Admin Login', icon: Shield, color: 'text-red-600 hover:text-red-700' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-gradient-to-r from-blue-500 to-purple-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
              <Home className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ESEP Portal</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.slice(0, 4).map(({ path, label, icon: Icon, color }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? `${color} bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm`
                    : `text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${color}`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
            <UtilitiesDropdown />
            {navItems.slice(4).map(({ path, label, icon: Icon, color }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? `${color} bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm`
                    : `text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${color}`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-purple-600 p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.slice(0, 4).map(({ path, label, icon: Icon, color }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? `${color} bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm`
                    : `text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${color}`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
            <div className="px-3 py-2">
              <UtilitiesDropdown />
            </div>
            {navItems.slice(4).map(({ path, label, icon: Icon, color }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? `${color} bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm`
                    : `text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${color}`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
