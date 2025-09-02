// src/Components/RemoveModal.tsx
import { Dialog, DialogContent, DialogOverlay } from "./ui/dialog.tsx";
import { Button } from "./ui/button.tsx";
import { Checkbox } from "./ui/checkbox.tsx";
import { useState } from "react";
import { ImageWithFallback } from './figma/ImageWithFallback.tsx';

interface RemoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: () => void;
  onBook: () => void;
  property: {
    id: string;
    name: string;
    location: string;
    pricePerNight: number;
    image: string;
  };
}

export function RemoveModal({ isOpen, onClose, onRemove, onBook, property }: RemoveModalProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  const handleKeepSaved = () => {
    onClose();
  };

  const handleBook = () => {
    onBook();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-xl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Remove from wishlist?</h2>
          
          {/* Property Details */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">{property.name}</h3>
              <p className="text-sm text-gray-600">{property.location}</p>
              <p className="text-sm font-medium text-gray-900">${property.pricePerNight}/night</p>
            </div>
          </div>

          {/* Information Text */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              You can always find it again in Explore. Removing will clear it from your saved list.
            </p>
          </div>

          {/* Don't ask again checkbox */}
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="dont-ask-again"
              checked={dontAskAgain}
              onCheckedChange={(checked) => setDontAskAgain(checked as boolean)}
            />
            <label
              htmlFor="dont-ask-again"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Don't ask again for this session
            </label>
          </div>

          {/* Item ID */}
          <p className="text-xs text-gray-400 mb-6">Item: #{property.id}</p>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleKeepSaved}
              className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Keep saved
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Remove
            </Button>
            <Button
              onClick={handleBook}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Book now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
