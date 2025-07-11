import React from 'react';
import { Plane, Clock, Users, DollarSign, CreditCard } from 'lucide-react';
import type { Flight } from '../types/flight.types';
import { useAuth } from '../contexts/AuthContext';

interface FlightListProps {
  flights: Flight[];
  loading?: boolean;
  onBookFlight?: (flight: Flight) => void;
}

export const FlightList: React.FC<FlightListProps> = ({ flights, loading, onBookFlight }) => {
  const { user } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12 bg-white bg-opacity-90 rounded-lg shadow-md backdrop-blur-sm">
        <Plane className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-600">No flights found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <div
          key={flight.id}
          className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{flight.airline}</h3>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <Plane className="mr-1" size={16} />
                  <span>{flight.source} → {flight.destination}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1" size={16} />
                  <span>{flight.departureTime}</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Departure: {new Date(flight.departureDate).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="text-2xl font-bold text-blue-600 flex items-center">
                <DollarSign size={20} />
                {flight.price.toFixed(2)}
              </div>
              <div className="mt-2 flex items-center text-gray-600">
                <Users className="mr-1" size={16} />
                <span>{flight.availableSeats} seats available</span>
              </div>
              {user && flight.availableSeats > 0 && (
                <button
                  onClick={() => onBookFlight?.(flight)}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 flex items-center"
                >
                  <CreditCard className="mr-2" size={16} />
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};