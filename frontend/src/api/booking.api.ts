import { axiosInstance } from './axios.config';
import type { Booking, BookingRequest, BookingFormData } from '../types/booking.types';

export const bookingApi = {
  // Create a new booking - matches POST /api/bookings
  createBooking: async (formData: BookingFormData): Promise<Booking> => {
    // Convert frontend form data to backend format
    const bookingRequest: BookingRequest = {
      flightId: formData.flightId.toString(), // Backend expects string
      numSeats: formData.numberOfSeats, // Map numberOfSeats to numSeats
    };
    
    const response = await axiosInstance.post('/api/bookings', bookingRequest);
    return response.data;
  },

  // Get all bookings for authenticated user - matches GET /api/bookings/user
  getUserBookings: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get('/api/bookings/user');
    return response.data;
  },

  // Get specific booking by ID - matches GET /api/bookings/{id}
  getBookingById: async (id: number): Promise<Booking> => {
    const response = await axiosInstance.get(`/api/bookings/${id}`);
    return response.data;
  },

  // Cancel booking - matches DELETE /api/bookings/cancel/{id}
  cancelBooking: async (id: number): Promise<string> => {
    const response = await axiosInstance.delete(`/api/bookings/cancel/${id}`);
    return response.data;
  },

  // Alternative endpoint for getting user bookings - matches GET /api/bookings/my
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get('/api/bookings/my');
    return response.data;
  },

  // Alternative booking creation endpoint - matches POST /api/bookings/book
  bookFlight: async (formData: BookingFormData): Promise<Booking> => {
    const bookingRequest: BookingRequest = {
      flightId: formData.flightId.toString(),
      numSeats: formData.numberOfSeats,
    };
    
    const response = await axiosInstance.post('/api/bookings/book', bookingRequest);
    return response.data;
  },
};