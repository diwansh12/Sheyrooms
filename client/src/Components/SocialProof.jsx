// components/SocialProof.jsx
import React from 'react';

const SocialProof = () => {
  const recentBookings = [
    {
      name: 'Anita',
      property: 'Deluxe Room in Mumbai',
      time: '2 minutes ago',
      color: 'green'
    },
    {
      name: 'Marcus',
      property: 'Studio in Berlin',
      time: '5 minutes ago',
      color: 'blue'
    },
    {
      name: 'Lisa',
      property: 'Beach House in Miami',
      time: '8 minutes ago',
      color: 'purple'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Testimonial */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
            <blockquote className="text-xl text-gray-900 mb-6">
              "SheyRooms made booking our family vacation so easy. The property was exactly as described and the support team was incredibly helpful."
            </blockquote>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <div className="ml-4">
                <div className="font-semibold text-gray-900">Sarah Johnson</div>
                <div className="text-gray-600 text-sm">Verified guest</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Join thousands of happy travelers</h3>
            {recentBookings.map((booking, index) => (
              <div 
                key={index} 
                className={`bg-${booking.color}-50 border border-${booking.color}-200 rounded-lg p-4`}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 bg-${booking.color}-500 rounded-full animate-pulse mr-3`}></div>
                  <span className="text-sm text-gray-700">
                    {booking.name} just booked a {booking.property}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">{booking.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
