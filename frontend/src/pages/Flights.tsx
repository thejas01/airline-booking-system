import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { FlightSearch } from '../components/FlightSearch';
import { FlightList } from '../components/FlightList';
import { AddFlight } from '../components/AddFlight';
import { BookingModal } from '../components/BookingModal';
import { flightApi } from '../api/flight.api';
import { bookingApi } from '../api/booking.api';
import type { Flight, FlightSearchParams, AddFlightRequest } from '../types/flight.types';
import type { BookingFormData } from '../types/booking.types';

export const Flights: React.FC = () => {
  const { user } = useAuth();
  const { isLoaded: bgLoaded } = useImagePreloader('/flights-bg-optimized.jpg');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddFlight, setShowAddFlight] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user) {
      loadAllFlights();
    }
  }, [user]);

  const loadAllFlights = async () => {
    setLoading(true);
    try {
      const data = await flightApi.getAllFlights();
      setFlights(data);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Failed to load flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (params: FlightSearchParams) => {
    setLoading(true);
    try {
      const data = await flightApi.searchFlights(params);
      setFlights(data);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Failed to search flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlight = async (flight: AddFlightRequest) => {
    await flightApi.addFlight(flight);
    loadAllFlights();
  };

  const handleBookFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowBooking(true);
  };

  const handleBookingSubmit = async (booking: BookingFormData) => {
    try {
      const response = await bookingApi.createBooking(booking);
      alert(`🎉 Booking confirmed successfully!\n\nBooking ID: ${response.id}\nTotal Amount: $${response.totalAmount}\nStatus: ${response.status}\n\nSeats have been reserved for you!`);
      
      // Refresh flights to update available seats
      loadAllFlights();
    } catch (error: any) {
      console.error('Booking failed:', error);
      const errorMessage = error.response?.data?.message || 'Booking failed. Please try again.';
      alert(`❌ Booking Failed\n\n${errorMessage}`);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat relative transition-opacity duration-500 ${
        bgLoaded ? 'opacity-100' : 'opacity-90'
      }`}
      style={{
        backgroundImage: bgLoaded ? 'url(/flights-bg-optimized.jpg)' : 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
      }}
    >
      {/* Dark overlay for better content readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Flight Booking</h1>
          {isAdmin && (
            <button
              onClick={() => setShowAddFlight(true)}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Add Flight
            </button>
          )}
        </div>
        
        <FlightSearch onSearch={handleSearch} />
      </div>

        {searchPerformed && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {flights.length > 0 ? 'Available Flights' : 'Search Results'}
            </h2>
            <FlightList flights={flights} loading={loading} onBookFlight={handleBookFlight} />
          </div>
        )}

        {showAddFlight && (
          <AddFlight
            onAdd={handleAddFlight}
            onClose={() => setShowAddFlight(false)}
          />
        )}

        {showBooking && selectedFlight && (
          <BookingModal
            flight={selectedFlight}
            onClose={() => {
              setShowBooking(false);
              setSelectedFlight(null);
            }}
            onBook={handleBookingSubmit}
          />
        )}
      </div>
    </div>
  );
};