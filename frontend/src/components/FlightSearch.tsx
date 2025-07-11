import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { FlightSearchParams } from '../types/flight.types';

interface FlightSearchProps {
  onSearch: (params: FlightSearchParams) => void;
}

export const FlightSearch: React.FC<FlightSearchProps> = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    source: '',
    destination: '',
    date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.source && searchParams.destination && searchParams.date) {
      onSearch(searchParams);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Search Flights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <input
            type="text"
            id="source"
            name="source"
            value={searchParams.source}
            onChange={handleChange}
            placeholder="Enter departure city"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={searchParams.destination}
            onChange={handleChange}
            placeholder="Enter destination city"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Departure Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={searchParams.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 flex items-center justify-center"
      >
        <Search className="mr-2" size={20} />
        Search Flights
      </button>
    </form>
  );
};