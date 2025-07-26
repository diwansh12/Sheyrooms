// components/booking/BookingSummary.jsx - Booking Summary Sidebar
import React from 'react';
import { Calendar, Users, MapPin, Clock, Tag } from 'lucide-react';
import Card from '../ui/Card';

const BookingSummary = ({ room, bookingData, checkIn, checkOut, totalNights }) => {
  const calculateTotal = () => {
    const { pricing, addOns } = bookingData;
    const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0);
    const subtotal = pricing.basePrice * totalNights + addOnTotal;
    const taxes = subtotal * 0.18;
    const serviceFee = subtotal * 0.05;
    return {
      subtotal,
      addOnTotal,
      taxes,
      serviceFee,
      total: subtotal + taxes + serviceFee
    };
  };

  const totals = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Room Details */}
      <Card>
        <div className="flex">
          <img
            src={room.imageurls[0]?.url || room.imageurls[0]}
            alt={room.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div className="ml-4 flex-1">
            <h3 className="font-semibold text-gray-900">{room.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin size={14} className="mr-1" />
              {room.type} Room
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Users size={14} className="mr-1" />
              Up to {room.maxcount} guests
            </div>
          </div>
        </div>
      </Card>

      {/* Booking Details */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Booking Details</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-2" />
              Check-in
            </div>
            <div className="font-medium">{checkIn.format('MMM DD, YYYY')}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-2" />
              Check-out
            </div>
            <div className="font-medium">{checkOut.format('MMM DD, YYYY')}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-2" />
              Duration
            </div>
            <div className="font-medium">{totalNights} night{totalNights > 1 ? 's' : ''}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Users size={16} className="mr-2" />
              Guests
            </div>
            <div className="font-medium">
              {Object.values(bookingData.guestCount).reduce((sum, count) => sum + count, 0)} guest{Object.values(bookingData.guestCount).reduce((sum, count) => sum + count, 0) > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </Card>

      {/* Add-ons */}
      {bookingData.addOns.length > 0 && (
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4">Add-on Services</h4>
          <div className="space-y-2">
            {bookingData.addOns.map((addOn) => (
              <div key={addOn.id} className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Tag size={14} className="mr-2 text-gray-400" />
                  {addOn.name}
                </div>
                <div className="font-medium">₹{addOn.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Price Breakdown */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Price Summary</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">
              ₹{bookingData.pricing.basePrice.toLocaleString()} × {totalNights} night{totalNights > 1 ? 's' : ''}
            </span>
            <span>₹{(bookingData.pricing.basePrice * totalNights).toLocaleString()}</span>
          </div>
          
          {totals.addOnTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Add-on services</span>
              <span>₹{totals.addOnTotal.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Service fee</span>
            <span>₹{totals.serviceFee.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes & fees</span>
            <span>₹{totals.taxes.toLocaleString()}</span>
          </div>
          
          <hr className="my-3" />
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-bold text-blue-600">₹{totals.total.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Cancellation Policy */}
      <Card className="bg-yellow-50 border-yellow-200">
        <h5 className="font-medium text-yellow-800 mb-2">Cancellation Policy</h5>
        <p className="text-sm text-yellow-700">
          Free cancellation until 24 hours before check-in. After that, cancellation fees may apply.
        </p>
      </Card>
    </div>
  );
};

export default BookingSummary;
