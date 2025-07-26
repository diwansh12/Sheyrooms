// components/ui/Badge.jsx - Professional Badge Component
import React from 'react';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  className = '',
  icon,
  onClick,
  closable = false,
  onClose,
  ...props
}) => {
  // Base styles
  const baseClasses = 'inline-flex items-center font-medium transition-all duration-200';

  // Variant styles
  const variants = {
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    light: 'bg-gray-50 text-gray-700 border border-gray-200',
    dark: 'bg-gray-800 text-white border border-gray-700',
    
    // Solid variants
    'primary-solid': 'bg-blue-600 text-white border border-blue-600',
    'secondary-solid': 'bg-gray-600 text-white border border-gray-600',
    'success-solid': 'bg-green-600 text-white border border-green-600',
    'danger-solid': 'bg-red-600 text-white border border-red-600',
    'warning-solid': 'bg-yellow-600 text-white border border-yellow-600',
    'info-solid': 'bg-cyan-600 text-white border border-cyan-600',
    
    // Outline variants
    'primary-outline': 'bg-transparent text-blue-600 border border-blue-600',
    'secondary-outline': 'bg-transparent text-gray-600 border border-gray-600',
    'success-outline': 'bg-transparent text-green-600 border border-green-600',
    'danger-outline': 'bg-transparent text-red-600 border border-red-600',
    'warning-outline': 'bg-transparent text-yellow-600 border border-yellow-600',
    'info-outline': 'bg-transparent text-cyan-600 border border-cyan-600',
    
    // Hotel-specific variants
    rating: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0',
    price: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
    status: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0',
    luxury: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0',
    featured: 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-0'
  };

  // Size styles
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-5 py-2.5 text-lg'
  };

  // Border radius
  const borderRadius = pill ? 'rounded-full' : 'rounded-lg';

  // Clickable styles
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : '';

  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size]}
    ${borderRadius}
    ${clickableClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (onClose) {
      onClose(e);
    }
  };

  return (
    <span
      className={badgeClasses}
      onClick={handleClick}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <span className="mr-1.5 flex-shrink-0">
          {icon}
        </span>
      )}

      {/* Content */}
      <span className="flex-grow">{children}</span>

      {/* Close button */}
      {closable && (
        <button
          type="button"
          className="ml-1.5 flex-shrink-0 hover:opacity-70 transition-opacity"
          onClick={handleClose}
          aria-label="Remove badge"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// Star Rating Badge Component
export const StarBadge = ({ rating, totalReviews, size = 'md', className = '' }) => {
  return (
    <Badge
      variant="rating"
      size={size}
      className={className}
      icon={
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      }
    >
      {rating.toFixed(1)} {totalReviews && `(${totalReviews})`}
    </Badge>
  );
};

// Price Badge Component
export const PriceBadge = ({ price, currency = '₹', size = 'md', className = '' }) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Badge
      variant="price"
      size={size}
      className={className}
      icon={
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      }
    >
      {formatPrice(price)}
    </Badge>
  );
};

// Status Badge Component
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const statusConfig = {
    confirmed: { variant: 'success', icon: '✓', text: 'Confirmed' },
    pending: { variant: 'warning', icon: '⏳', text: 'Pending' },
    cancelled: { variant: 'danger', icon: '✗', text: 'Cancelled' },
    'checked-in': { variant: 'info', icon: '🏨', text: 'Checked In' },
    'checked-out': { variant: 'secondary', icon: '📤', text: 'Checked Out' },
    available: { variant: 'success', icon: '✓', text: 'Available' },
    unavailable: { variant: 'danger', icon: '✗', text: 'Unavailable' },
    maintenance: { variant: 'warning', icon: '🔧', text: 'Maintenance' }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
    >
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </Badge>
  );
};

// Amenity Badge Component
export const AmenityBadge = ({ amenity, size = 'sm', className = '' }) => {
  const amenityIcons = {
    wifi: '📶',
    parking: '🅿️',
    pool: '🏊',
    gym: '💪',
    spa: '🧘',
    restaurant: '🍽️',
    bar: '🍸',
    'room-service': '🛎️',
    'air-conditioning': '❄️',
    heating: '🔥',
    'pet-friendly': '🐕',
    'non-smoking': '🚭',
    balcony: '🌅',
    'sea-view': '🌊',
    'city-view': '🏙️',
    'mountain-view': '⛰️'
  };

  const icon = amenityIcons[amenity.toLowerCase()] || '🏨';

  return (
    <Badge
      variant="light"
      size={size}
      className={className}
    >
      <span className="mr-1">{icon}</span>
      {amenity}
    </Badge>
  );
};

// Room Type Badge Component
export const RoomTypeBadge = ({ type, size = 'md', className = '' }) => {
  const typeConfig = {
    standard: { variant: 'secondary', icon: '🛏️' },
    deluxe: { variant: 'primary', icon: '🛏️✨' },
    suite: { variant: 'luxury', icon: '🏛️' },
    presidential: { variant: 'featured', icon: '👑' },
    family: { variant: 'info', icon: '👨‍👩‍👧‍👦' },
    business: { variant: 'dark', icon: '💼' }
  };

  const config = typeConfig[type.toLowerCase()] || typeConfig.standard;

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
    >
      <span className="mr-1">{config.icon}</span>
      {type}
    </Badge>
  );
};

export default Badge;
