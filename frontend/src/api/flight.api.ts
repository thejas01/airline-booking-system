import { axiosInstance } from './axios.config';
import type { Flight, FlightSearchParams, AddFlightRequest } from '../types/flight.types';

export const flightApi = {
  // Get all flights - matches GET /api/flights
  getAllFlights: async (): Promise<Flight[]> => {
    const response = await axiosInstance.get('/api/flights');
    return response.data;
  },

  // Search flights - matches GET /api/flights/search
  searchFlights: async (params: FlightSearchParams): Promise<Flight[]> => {
    const response = await axiosInstance.get('/api/flights/search', {
      params: {
        source: params.source,
        destination: params.destination,
        date: params.date,
      },
    });
    return response.data;
  },

  // Get flight by ID - matches GET /api/flights/{id}
  getFlightById: async (id: number): Promise<Flight> => {
    const response = await axiosInstance.get(`/api/flights/${id}`);
    return response.data;
  },

  // Add new flight (Admin only) - matches POST /api/flights/add
  addFlight: async (flight: AddFlightRequest): Promise<string> => {
    const response = await axiosInstance.post('/api/flights/add', flight);
    return response.data;
  },

  // Delete flight (Admin only) - matches DELETE /api/admin/flights/{id}
  deleteFlight: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/admin/flights/${id}`);
  },
};