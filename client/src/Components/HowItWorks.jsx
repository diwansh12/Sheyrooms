// components/HowItWorks.jsx
import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'Search',
      description: 'Enter your destination, dates, and number of guests to find available properties.',
      bgColor: 'bg-primary',
      textColor: 'text-white'
    },
    {
      number: 2,
      title: 'Compare',
      description: 'Browse verified listings, read reviews, and compare prices to find your perfect match.',
      bgColor: 'bg-accent',
      textColor: 'text-white'
    },
    {
      number: 3,
      title: 'Book',
      description: 'Secure your reservation with our safe payment system and enjoy your stay.',
      bgColor: 'bg-purple-600',
      textColor: 'text-white'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className={`w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center ${step.textColor} text-2xl font-bold mx-auto mb-4`}>
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
