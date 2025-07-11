import { axiosInstance } from './axios.config';
import type { Payment, PaymentRequest, PaymentResponse } from '../types/payment.types';

export const paymentApi = {
  // Process a payment for a booking
  processPayment: async (paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    const response = await axiosInstance.post('/api/payments', paymentRequest);
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await axiosInstance.get(`/api/payments/${id}`);
    return response.data;
  },

  // Get payment by booking ID
  getPaymentByBookingId: async (bookingId: number): Promise<Payment> => {
    const response = await axiosInstance.get(`/api/payments/booking/${bookingId}`);
    return response.data;
  },

  // Get all payments for a user
  getUserPayments: async (userId: string): Promise<Payment[]> => {
    const response = await axiosInstance.get(`/api/payments/user/${userId}`);
    return response.data;
  },

  // Initiate refund for a payment
  initiateRefund: async (paymentId: number, refundAmount: number): Promise<PaymentResponse> => {
    const response = await axiosInstance.post(`/api/payments/${paymentId}/refund`, null, {
      params: { refundAmount }
    });
    return response.data;
  },
};