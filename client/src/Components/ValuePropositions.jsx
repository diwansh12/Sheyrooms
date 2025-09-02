// components/ValuePropositions.jsx
import React from 'react';

const ValuePropositions = () => {
  const values = [
    {
      icon: 'fas fa-shield-alt',
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
      title: 'Verified listings',
      description: 'All properties are verified for quality and authenticity'
    },
    {
      icon: 'fas fa-receipt',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      title: 'Transparent pricing',
      description: 'No hidden fees. See total cost upfront including taxes'
    },
    {
      icon: 'fas fa-lock',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      title: 'Secure payments',
      description: 'Your payment information is protected with bank-level security'
    },
    {
      icon: 'fas fa-headset',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      title: '24/7 support',
      description: 'Get help anytime with our round-the-clock customer support'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className={`w-12 h-12 ${value.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <i className={`${value.icon} ${value.iconColor} text-xl`}></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600 text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositions;
