// components/booking/RoomPreferences.jsx - Room Preferences Component
import React from 'react';
import { Bed, Wind, Volume2, Accessibility, Clock, Coffee } from 'lucide-react';
import Card from '../ui/Card';

const RoomPreferences = ({ data, onChange }) => {
  const updatePreferences = (field, value) => {
    onChange({
      preferences: {
        ...data.preferences,
        [field]: value
      }
    });
  };

  const toggleAddOn = (addOnId, name, price) => {
    const exists = data.addOns.find(item => item.id === addOnId);
    
    if (exists) {
      onChange({
        addOns: data.addOns.filter(item => item.id !== addOnId)
      });
    } else {
      onChange({
        addOns: [...data.addOns, { id: addOnId, name, price }]
      });
    }
  };

  const addOns = [
    { id: 'breakfast', name: 'Continental Breakfast', price: 500, icon: <Coffee size={20} />, description: 'Start your day right' },
    { id: 'airport-pickup', name: 'Airport Pickup', price: 1500, icon: <Accessibility size={20} />, description: 'Complimentary pickup service' },
    { id: 'early-checkin', name: 'Early Check-in', price: 1000, icon: <Clock size={20} />, description: 'Check-in before 2 PM' },
    { id: 'late-checkout', name: 'Late Check-out', price: 1000, icon: <Clock size={20} />, description: 'Check-out after 12 PM' },
    { id: 'extra-bed', name: 'Extra Bed', price: 800, icon: <Bed size={20} />, description: 'Additional sleeping arrangement' },
    { id: 'spa-access', name: 'Spa Access', price: 2000, icon: <Wind size={20} />, description: 'Full day spa facility access' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Preferences</h2>
        <p className="text-gray-600">Customize your stay to make it perfect</p>
      </div>

      {/* Room Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bed size={16} className="inline mr-1" />
              Bed Type Preference
            </label>
            <select
              value={data.preferences.bedType}
              onChange={(e) => updatePreferences('bedType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">No Preference</option>
              <option value="single">Single Bed</option>
              <option value="double">Double Bed</option>
              <option value="queen">Queen Bed</option>
              <option value="king">King Bed</option>
              <option value="twin">Twin Beds</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Preference
            </label>
            <select
              value={data.preferences.floor}
              onChange={(e) => updatePreferences('floor', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">No Preference</option>
              <option value="low">Lower Floor (1-3)</option>
              <option value="mid">Mid Floor (4-7)</option>
              <option value="high">Higher Floor (8+)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="smoking"
              checked={data.preferences.smokingRoom}
              onChange={(e) => updatePreferences('smokingRoom', e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="smoking" className="flex items-center text-gray-700">
              <Volume2 size={16} className="mr-2" />
              Smoking Room
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="accessible"
              checked={data.preferences.accessibleRoom}
              onChange={(e) => updatePreferences('accessibleRoom', e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="accessible" className="flex items-center text-gray-700">
              <Accessibility size={16} className="mr-2" />
              Wheelchair Accessible Room
            </label>
          </div>
        </div>
      </Card>

      {/* Add-on Services */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add-on Services</h3>
        <p className="text-gray-600 mb-6">Enhance your stay with our premium services</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addOns.map((addOn) => {
            const isSelected = data.addOns.find(item => item.id === addOn.id);
            
            return (
              <div
                key={addOn.id}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleAddOn(addOn.id, addOn.name, addOn.price)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="text-blue-600 mr-3 mt-1">
                      {addOn.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{addOn.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{addOn.description}</p>
                      <p className="text-lg font-bold text-blue-600">₹{addOn.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1"
                  />
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Special Requests */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
        <textarea
          value={data.specialRequests}
          onChange={(e) => onChange({ specialRequests: e.target.value })}
          placeholder="Any special requests or requirements? (e.g., celebration, dietary needs, mobility assistance)"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          maxLength={500}
        />
        <div className="mt-2 text-right text-sm text-gray-500">
          {data.specialRequests.length}/500 characters
        </div>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Restrictions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Vegetarian',
            'Vegan',
            'Gluten-free',
            'Dairy-free',
            'Nut-free',
            'Halal',
            'Kosher',
            'Other'
          ].map((diet) => (
            <label key={diet} className="flex items-center">
              <input
                type="checkbox"
                checked={data.dietaryRestrictions.includes(diet)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange({
                      dietaryRestrictions: [...data.dietaryRestrictions, diet]
                    });
                  } else {
                    onChange({
                      dietaryRestrictions: data.dietaryRestrictions.filter(d => d !== diet)
                    });
                  }
                }}
                className="mr-2"
              />
              {diet}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RoomPreferences;
