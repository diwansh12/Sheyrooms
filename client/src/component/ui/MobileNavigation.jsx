// components/ui/MobileNavigation.jsx - Mobile-First Navigation
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Calendar, 
  Heart, 
  Settings,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileNavigation = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/home', color: 'text-blue-600' },
    { icon: Search, label: 'Search', path: '/search', color: 'text-green-600' },
    { icon: Calendar, label: 'Bookings', path: '/profile?tab=2', color: 'text-purple-600' },
    { icon: Heart, label: 'Favorites', path: '/profile?tab=3', color: 'text-red-600' },
    { icon: User, label: 'Profile', path: '/profile', color: 'text-indigo-600' }
  ];

  if (user?.isAdmin) {
    navigationItems.push({ 
      icon: Settings, 
      label: 'Admin', 
      path: '/admin', 
      color: 'text-orange-600' 
    });
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/home" className="text-2xl font-bold text-gray-900">
            SheyRooms
          </Link>
          
          <div className="flex items-center space-x-3">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell size={20} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-semibold">2</span>
              </div>
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed top-0 right-0 w-80 h-full bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="text-white" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user?.fullName || user?.name || 'Guest User'}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    {user?.loyaltyProgram?.level && (
                      <div className="inline-flex px-2 py-1 bg-gold-100 text-gold-800 text-xs font-semibold rounded-full mt-1">
                        {user.loyaltyProgram.level} Member
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path.split('?')[0];
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} className={isActive ? 'text-blue-600' : item.color} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
        <div className="flex justify-around">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path.split('?')[0];
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
