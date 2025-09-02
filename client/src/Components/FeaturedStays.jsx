// components/FeaturedStays.jsx
import React from 'react';

const FeaturedStays = () => {
  const stays = [
    {
      id: 1,
      title: 'Luxury Downtown Loft',
      location: 'Manhattan, New York',
      rating: 4.8,
      price: 189,
      gradient: 'from-blue-400 to-purple-500',
      badges: ['Free cancellation', 'Breakfast included'],
      badgeColors: ['bg-accent/10 text-accent', 'bg-blue-100 text-blue-600']
    },
    {
      id: 2,
      title: 'Cozy Beach House',
      location: 'Malibu, California',
      rating: 4.6,
      price: 245,
      gradient: 'from-green-400 to-blue-500',
      badges: ['Free cancellation', 'Ocean view'],
      badgeColors: ['bg-accent/10 text-accent', 'bg-purple-100 text-purple-600']
    },
    {
      id: 3,
      title: 'Historic City Apartment',
      location: 'Paris, France',
      rating: 4.9,
      price: 156,
      gradient: 'from-orange-400 to-red-500',
      badges: ['Free cancellation', 'City center'],
      badgeColors: ['bg-accent/10 text-accent', 'bg-orange-100 text-orange-600']
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Stays</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stays.map((stay) => (
            <div key={stay.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-48 bg-gradient-to-br ${stay.gradient}`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{stay.title}</h3>
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <span className="text-sm text-gray-600 ml-1">{stay.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{stay.location}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {stay.badges.map((badge, index) => (
                    <span key={index} className={`px-2 py-1 text-xs rounded-full ${stay.badgeColors[index]}`}>
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${stay.price}</span>
                    <span className="text-gray-600 text-sm">/night</span>
                  </div>
                  <button className="text-primary hover:text-blue-700 font-medium">View details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStays;
