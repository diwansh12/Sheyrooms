import { Building2 } from "lucide-react";

interface SheyRoomsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function SheyRoomsLogo({ size = 'md', showText = true }: SheyRoomsLogoProps) {
  const sizeClasses = {
    sm: {
      container: "w-8 h-8",
      icon: "w-5 h-5",
      text: "text-lg"
    },
    md: {
      container: "w-12 h-12",
      icon: "w-7 h-7",
      text: "text-xl"
    },
    lg: {
      container: "w-16 h-16",
      icon: "w-9 h-9",
      text: "text-2xl"
    }
  };

  return (
    <div className="flex items-center">
      {/* Logo Icon */}
      <div className={`${sizeClasses[size].container} bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/20 rounded-full"></div>
        </div>
        
        {/* Hotel Building Icon */}
        <div className="relative z-10">
          <Building2 className={`${sizeClasses[size].icon} text-white`} strokeWidth={2} />
          {/* Small accent dot to represent rooms */}
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full border border-white/50"></div>
        </div>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <span className={`ml-3 font-bold text-gray-900 ${sizeClasses[size].text} tracking-tight`}>
          <span className="text-blue-600">Shey</span>
          <span className="text-gray-900">Rooms</span>
        </span>
      )}
    </div>
  );
}