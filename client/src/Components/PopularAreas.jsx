// components/PopularAreas.jsx
import React, { useState } from 'react';

const PopularAreas = () => {
  const [activeArea, setActiveArea] = useState('City Center');
  
  const areas = ['City Center', 'Near Station', 'Budget Stays', 'Family-friendly', 'Business', 'Long-stays'];

  const handleAreaClick = (area) => {
    setActiveArea(area);
    console.log(`Filtering for: ${area}`);
    // Handle filtering logic here
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Areas</h2>
        <div className="flex flex-wrap gap-3">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => handleAreaClick(area)}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                activeArea === area
                  ? 'bg-primary text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularAreas;
