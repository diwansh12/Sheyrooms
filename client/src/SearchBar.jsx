// components/SearchBar.jsx
import React, { useState } from 'react';

const SearchBar = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    checkin: '',
    checkout: '',
    guests: '1 guest'
  });

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = () => {
    if (searchData.destination && searchData.checkin && searchData.checkout) {
      // Handle search logic here
      console.log('Searching with:', searchData);
      // Navigate to search results page
      // router.push(`/search?destination=${searchData.destination}&checkin=${searchData.checkin}...`);
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <input 
            type="text" 
            name="destination"
            placeholder="Where are you going?" 
            value={searchData.destination}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
          <i className="fas fa-map-marker-alt absolute right-3 top-11 text-gray-400"></i>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
          <input 
            type="date" 
            name="checkin"
            value={searchData.checkin}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
          <input 
            type="date" 
            name="checkout"
            value={searchData.checkout}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
          <select 
            name="guests"
            value={searchData.guests}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          >
            <option>1 guest</option>
            <option>2 guests</option>
            <option>3 guests</option>
            <option>4+ guests</option>
          </select>
        </div>
      </div>
      <button 
        onClick={handleSearch}
        className="w-full mt-6 bg-primary text-white py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg"
      >
        <i className="fas fa-search mr-2"></i>Search
      </button>
    </div>
  );
};

export default SearchBar;
