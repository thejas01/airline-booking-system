import { axiosInstance } from './axios.config';
import type { User } from '../types/auth.types';

// Backend Booking entity format
export interface AdminBooking {
  id: number;
  userEmail: string;
  flightId: number;
  bookingDate: string;
  numberOfSeats: number;
  totalPrice: number;
  status: string; // PENDING, CONFIRMED, PAID, CANCELLED
}

export interface BookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  bookingsByStatus: Record<string, number>;
  todayBookings: number;
  monthlyRevenue: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const adminApi = {
  // Booking management
  getAllBookings: async (page = 0, size = 10, sortBy = 'id', sortDirection = 'DESC') => {
    const response = await axiosInstance.get<PaginatedResponse<AdminBooking>>('/api/admin/bookings', {
      params: { page, size, sortBy, sortDirection }
    });
    return response.data;
  },

  getBookingById: async (id: number) => {
    const response = await axiosInstance.get<AdminBooking>(`/api/admin/bookings/${id}`);
    return response.data;
  },

  getBookingsByUser: async (userEmail: string) => {
    const response = await axiosInstance.get<AdminBooking[]>(`/api/admin/bookings/user/${userEmail}`);
    return response.data;
  },

  getBookingsByFlight: async (flightId: number) => {
    const response = await axiosInstance.get<AdminBooking[]>(`/api/admin/bookings/flight/${flightId}`);
    return response.data;
  },

  updateBookingStatus: async (id: number, status: string) => {
    const response = await axiosInstance.put<AdminBooking>(`/api/admin/bookings/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  cancelBooking: async (id: number) => {
    const response = await axiosInstance.put<AdminBooking>(`/api/admin/bookings/${id}/cancel`);
    return response.data;
  },

  // Statistics
  getBookingStatistics: async () => {
    const response = await axiosInstance.get<BookingStatistics>('/api/admin/bookings/statistics');
    return response.data;
  },

  // Search
  searchBookings: async (params: {
    userEmail?: string;
    flightId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await axiosInstance.get<AdminBooking[]>('/api/admin/bookings/search', { params });
    return response.data;
  },

  // Recent bookings
  getRecentBookings: async (limit = 10) => {
    const response = await axiosInstance.get<AdminBooking[]>('/api/admin/bookings/recent', {
      params: { limit }
    });
    return response.data;
  },

  // Revenue
  getRevenueByFlight: async () => {
    const response = await axiosInstance.get<Record<number, number>>('/api/admin/bookings/revenue/by-flight');
    return response.data;
  },

  getRevenueByDate: async (days = 30) => {
    const response = await axiosInstance.get<Record<string, number>>('/api/admin/bookings/revenue/by-date', {
      params: { days }
    });
    return response.data;
  },

  // Bulk operations
  bulkCancelBookings: async (flightId: number) => {
    const response = await axiosInstance.post<{ cancelledBookings: number; flightId: number }>(
      '/api/admin/bookings/bulk-cancel',
      null,
      { params: { flightId } }
    );
    return response.data;
  },

  // User management
  getAllUsers: async (page = 0, size = 100) => {
    const response = await axiosInstance.get<PaginatedResponse<User>>('/api/admin/users', {
      params: { page, size }
    });
    return response.data.content || [];
  },

  getUserById: async (id: number) => {
    const response = await axiosInstance.get<User>(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: number, role: string) => {
    const response = await axiosInstance.put<User>(`/api/admin/users/${id}/role`, null, {
      params: { role }
    });
    return response.data;
  },

  deleteUser: async (id: number) => {
    await axiosInstance.delete(`/api/admin/users/${id}`);
  }
};