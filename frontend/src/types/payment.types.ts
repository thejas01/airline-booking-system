export interface PaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
  
  // Card details (for card payments)
  cardNumber?: string;
  cvv?: string;
  expiryMonth?: string;
  expiryYear?: string;
  
  // UPI details
  upiId?: string;
  
  // Wallet details
  walletProvider?: string;
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  paymentTime: string;
  message: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentTime: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  refundAmount?: number;
  failureReason?: string;
}

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'UPI'
  | 'NET_BANKING'
  | 'WALLET'
  | 'CASH_ON_DELIVERY';

export interface PaymentFormData {
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cvv?: string;
  expiryMonth?: string;
  expiryYear?: string;
  upiId?: string;
  walletProvider?: string;
}