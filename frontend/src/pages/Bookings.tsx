import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plane, CreditCard, X, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { bookingApi } from '../api/booking.api';
import { flightApi } from '../api/flight.api';
import { paymentApi } from '../api/payment.api';
import { PaymentModal } from '../components/PaymentModal';
import type { BookingWithFlight } from '../types/booking.types';
import type { Payment } from '../types/payment.types';

export const Bookings: React.FC = () => {
  const { user } = useAuth();
  const { isLoaded: bgLoaded } = useImagePreloader('/bookings-bg-optimized.jpg');
  const [bookings, setBookings] = useState<BookingWithFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Map<number, Payment>>(new Map());
  const [selectedBooking, setSelectedBooking] = useState<BookingWithFlight | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadBookings();
    loadPayments();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Get user's bookings from backend
      const userBookings = await bookingApi.getUserBookings();
      
      // Enhance bookings with flight details
      const bookingsWithFlights: BookingWithFlight[] = await Promise.all(
        userBookings.map(async (booking) => {
          try {
            const flight = await flightApi.getFlightById(parseInt(booking.flightId));
            return {
              ...booking,
              flight: {
                airline: flight.airline,
                source: flight.source,
                destination: flight.destination,
                departureDate: flight.departureDate,
                departureTime: flight.departureTime,
                price: flight.price,
              },
            };
          } catch (error) {
            console.error(`Failed to load flight ${booking.flightId}:`, error);
            return booking; // Return booking without flight details if fetch fails
          }
        })
      );
      
      setBookings(bookingsWithFlights);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const userPayments = await paymentApi.getUserPayments(user?.email || '');
      const paymentsMap = new Map<number, Payment>();
      userPayments.forEach(payment => {
        paymentsMap.set(payment.bookingId, payment);
      });
      setPayments(paymentsMap);
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  const handlePaymentClick = (booking: BookingWithFlight) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    loadPayments();
    loadBookings();
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (confirm('Are you sure you want to cancel this booking? The seats will be restored to the flight.')) {
      try {
        const response = await bookingApi.cancelBooking(bookingId);
        alert(`${response}\n\nYour booking has been cancelled and seats have been restored to the flight.`);
        // Reload bookings to reflect the cancellation
        loadBookings();
      } catch (error: any) {
        console.error('Failed to cancel booking:', error);
        const errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
        alert(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div 
        className={`min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat relative transition-opacity duration-500 ${
          bgLoaded ? 'opacity-100' : 'opacity-90'
        }`}
        style={{
          backgroundImage: bgLoaded ? 'url(/bookings-bg-optimized.jpg)' : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div 
        className={`min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat relative transition-opacity duration-500 ${
          bgLoaded ? 'opacity-100' : 'opacity-90'
        }`}
        style={{
          backgroundImage: bgLoaded ? 'url(/bookings-bg-optimized.jpg)' : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl font-bold text-white mb-8">My Bookings</h1>
          <div className="text-center py-12 bg-white bg-opacity-90 rounded-lg shadow-md backdrop-blur-sm">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg text-gray-600">No bookings found</p>
            <p className="text-gray-500">Book your first flight to see it here!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat relative transition-opacity duration-500 ${
        bgLoaded ? 'opacity-100' : 'opacity-90'
      }`}
      style={{
        backgroundImage: bgLoaded ? 'url(/bookings-bg-optimized.jpg)' : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-8">My Bookings</h1>
      
      <div className="space-y-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className={`bg-white bg-opacity-90 p-6 rounded-lg shadow-md backdrop-blur-sm border-l-4 ${
              booking.status === 'CONFIRMED' && payments.has(booking.id!)
                ? 'border-green-500' 
                : booking.status === 'CONFIRMED' && !payments.has(booking.id!)
                ? 'border-yellow-500'
                : booking.status === 'CANCELLED'
                ? 'border-red-500 opacity-75' 
                : 'border-gray-500'
            }`}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Booking #{booking.id}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    {booking.status === 'CONFIRMED' && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payments.has(booking.id!)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {payments.has(booking.id!) ? 'Paid' : 'Payment Pending'}
                      </span>
                    )}
                  </div>
                </div>

                {booking.flight && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {booking.flight.airline}
                      </h4>
                      <div className="flex items-center text-gray-600 mb-1">
                        <Plane className="mr-2" size={16} />
                        <span>
                          {booking.flight.source} → {booking.flight.destination}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <Calendar className="mr-2" size={16} />
                        <span>
                          {new Date(booking.flight.departureDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="mr-2" size={16} />
                        <span>{booking.flight.departureTime}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Booking Email:</strong> {booking.userEmail}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Seats:</strong> {booking.numSeats}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Booked on:</strong>{' '}
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end">
                <div className="text-2xl font-bold text-green-600 mb-4">
                  ${booking.totalAmount.toFixed(2)}
                </div>
                
                {booking.status === 'CONFIRMED' ? (
                  <div className="flex flex-col gap-2">
                    {!payments.has(booking.id!) ? (
                      <button
                        onClick={() => handlePaymentClick(booking)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 flex items-center"
                      >
                        <DollarSign className="mr-2" size={16} />
                        Pay Now
                      </button>
                    ) : (
                      <div className="text-sm text-green-600 flex items-center">
                        <CreditCard className="mr-2" size={16} />
                        Payment Completed
                      </div>
                    )}
                    <button
                      onClick={() => handleCancelBooking(booking.id!)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 flex items-center"
                    >
                      <X className="mr-2" size={16} />
                      Cancel Booking
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    {booking.status === 'CANCELLED' ? 'Booking Cancelled' : booking.status}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBooking && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      </div>
    </div>
  );
};