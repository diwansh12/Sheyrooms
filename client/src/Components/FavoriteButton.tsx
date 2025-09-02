// src/Components/FavoriteButton.tsx
import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from './ui/utils.ts'; // or your utility function
import { useWishlist } from '../hooks/useWishlist.tsx';

interface FavoriteButtonProps {
  room: {
    id: string;
    name: string;
    location: string;
    pricePerNight: number;
    image: string;
    rating?: number;
    type?: string;

  };
  className?: string;
   variant?: 'floating' | 'inline' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function FavoriteButton({ 
  room, 
  className = '', 
  size = 'md', 
  showText = false 
}: FavoriteButtonProps) {
  const { items, add, remove } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  
  // Check if room is already in favorites
  const isFavorite = items.some(item => item.id === room.id);
  
  const toggleFavorite = async () => {
    if (isToggling) return; // Prevent double clicks
    
    setIsToggling(true);
    
    try {
      if (isFavorite) {
        await remove(room.id);
        console.log(`Removed ${room.name} from favorites`);
      } else {
        await add(room.id);
        console.log(`Added ${room.name} to favorites`);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Optionally show toast notification
      // toast.error('Failed to update favorites. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isToggling}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110',
        'bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl',
        'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100',
        isFavorite 
          ? 'text-red-500 hover:bg-red-50' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-red-500',
        sizeClasses[size],
        className
      )}
      aria-label={isFavorite ? `Remove ${room.name} from favorites` : `Add ${room.name} to favorites`}
    >
      {isToggling ? (
        <Loader2 className={cn('animate-spin', iconSizes[size])} />
      ) : (
        <Heart 
          className={cn(
            iconSizes[size],
            isFavorite ? 'fill-current' : ''
          )} 
        />
      )}
      
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isFavorite ? 'Remove' : 'Save'}
        </span>
      )}
    </button>
  );
}
