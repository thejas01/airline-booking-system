import React, { useState } from 'react';
import { X, CreditCard, Users } from 'lucide-react';
import type { Flight } from '../types/flight.types';
import type { BookingFormData } from '../types/booking.types';
import { useAuth } from '../contexts/AuthContext';

interface BookingModalProps {
  flight: Flight;
  onClose: () => void;
  onBook: (booking: BookingFormData) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({ flight, onClose, onBook }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onBook({
        flightId: flight.id,
        numberOfSeats,
      });
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Booking failed. Please try again.');
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = flight.price * numberOfSeats;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Book Flight</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800">{flight.airline}</h3>
          <p className="text-gray-600">{flight.source} → {flight.destination}</p>
          <p className="text-sm text-gray-500">
            {new Date(flight.departureDate).toLocaleDateString()} at {flight.departureTime}
          </p>
          <p className="text-lg font-bold text-blue-600">${flight.price.toFixed(2)} per seat</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Booking for:</p>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="inline mr-1" size={16} />
                Number of Seats
              </label>
              <select
                value={numberOfSeats}
                onChange={(e) => setNumberOfSeats(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {Array.from({ length: Math.min(flight.availableSeats, 10) }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'seat' : 'seats'}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              disabled={loading || !flight.availableSeats}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CreditCard className="mr-2" size={16} />
                  Book Flight
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};