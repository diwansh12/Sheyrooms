// components/ui/ResponsiveContainer.jsx - Responsive Layout Component
import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const ResponsiveContainer = ({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = 'default'
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const paddingClasses = {
    none: '',
    sm: isMobile ? 'px-2 py-2' : 'px-4 py-4',
    default: isMobile ? 'px-4 py-4' : 'px-6 py-6',
    lg: isMobile ? 'px-4 py-6' : 'px-8 py-8'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
