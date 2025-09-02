// components/HeroSection.jsx
import React, { useState } from 'react';
import SearchBar from '../SearchBar';

const HeroSection = () => {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect Stay, <span className="text-primary">Anywhere, Anytime.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Verified rooms, transparent pricing, secure checkout. Experience seamless booking with 24/7 support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg">
                Search stays
              </button>
              <button className="text-primary hover:text-blue-700 font-semibold text-lg">
                Explore deals →
              </button>
            </div>
            
            <SearchBar />
          </div>
          
          {/* Right Column - Hero Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 text-white">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4">Booking made simple</h3>
                <p className="text-lg opacity-90">Join millions of travelers who trust SheyRooms for their perfect stays.</p>
                <div className="mt-6 flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/30"></div>
                    <div className="w-8 h-8 rounded-full bg-white/30"></div>
                    <div className="w-8 h-8 rounded-full bg-white/30"></div>
                  </div>
                  <span className="text-sm">1M+ happy customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
