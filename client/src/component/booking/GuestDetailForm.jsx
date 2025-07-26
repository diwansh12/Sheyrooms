// components/booking/GuestDetailsForm.jsx - Guest Details Component
import React from 'react';
import { Plus, Minus, User, Mail, Phone, Globe } from 'lucide-react';
import Button from '../ui/Button';

const GuestDetailsForm = ({ data, onChange, room, totalNights }) => {
  const updatePrimaryGuest = (field, value) => {
    onChange({
      primaryGuest: {
        ...data.primaryGuest,
        [field]: value
      }
    });
  };

  const updateGuestCount = (type, increment) => {
    const currentCount = data.guestCount[type];
    const newCount = Math.max(0, currentCount + (increment ? 1 : -1));
    
    // Ensure total doesn't exceed room capacity
    const total = Object.values({...data.guestCount, [type]: newCount}).reduce((sum, count) => sum + count, 0);
    
    if (total <= room.maxcount) {
      onChange({
        guestCount: {
          ...data.guestCount,
          [type]: newCount
        }
      });
    }
  };

  const addAdditionalGuest = () => {
    const newGuest = {
      id: Date.now(),
      firstName: '',
      lastName: '',
      age: '',
      relation: 'friend'
    };
    
    onChange({
      additionalGuests: [...data.additionalGuests, newGuest]
    });
  };

  const updateAdditionalGuest = (guestId, field, value) => {
    const updatedGuests = data.additionalGuests.map(guest =>
      guest.id === guestId ? { ...guest, [field]: value } : guest
    );
    
    onChange({
      additionalGuests: updatedGuests
    });
  };

  const removeAdditionalGuest = (guestId) => {
    onChange({
      additionalGuests: data.additionalGuests.filter(guest => guest.id !== guestId)
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Guest Information</h2>
        <p className="text-gray-600">Please provide details for the primary guest</p>
      </div>

      {/* Guest Count Selector */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How many guests?</h3>
        <div className="space-y-4">
          {[
            { key: 'adults', label: 'Adults', subtitle: '13+ years' },
            { key: 'children', label: 'Children', subtitle: '2-12 years' },
            { key: 'infants', label: 'Infants', subtitle: '0-2 years' }
          ].map(({ key, label, subtitle }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-500">{subtitle}</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateGuestCount(key, false)}
                  disabled={data.guestCount[key] === 0 || (key === 'adults' && data.guestCount[key] === 1)}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-medium">{data.guestCount[key]}</span>
                <button
                  onClick={() => updateGuestCount(key, true)}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Maximum {room.maxcount} guests allowed • Current total: {Object.values(data.guestCount).reduce((sum, count) => sum + count, 0)}
        </div>
      </div>

      {/* Primary Guest Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Guest Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              First Name *
            </label>
            <input
              type="text"
              value={data.primaryGuest.firstName}
              onChange={(e) => updatePrimaryGuest('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter first name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Last Name *
            </label>
            <input
              type="text"
              value={data.primaryGuest.lastName}
              onChange={(e) => updatePrimaryGuest('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter last name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              value={data.primaryGuest.email}
              onChange={(e) => updatePrimaryGuest('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              Phone Number *
            </label>
            <div className="flex">
              <select
                value={data.primaryGuest.countryCode}
                onChange={(e) => updatePrimaryGuest('countryCode', e.target.value)}
                className="px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
              </select>
              <input
                type="tel"
                value={data.primaryGuest.phone}
                onChange={(e) => updatePrimaryGuest('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Guests */}
      {data.guestCount.adults + data.guestCount.children > 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Guest Details</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addAdditionalGuest}
              icon={<Plus size={16} />}
            >
              Add Guest
            </Button>
          </div>
          
          <div className="space-y-4">
            {data.additionalGuests.map((guest, index) => (
              <div key={guest.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Guest {index + 2}</h4>
                  <button
                    onClick={() => removeAdditionalGuest(guest.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={guest.firstName}
                    onChange={(e) => updateAdditionalGuest(guest.id, 'firstName', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={guest.lastName}
                    onChange={(e) => updateAdditionalGuest(guest.id, 'lastName', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={guest.age}
                    onChange={(e) => updateAdditionalGuest(guest.id, 'age', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="120"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 mr-3"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailsForm;
