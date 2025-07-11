import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { paymentApi } from '../api/payment.api';
import type { Booking } from '../types/booking.types';
import type { PaymentFormData, PaymentMethod } from '../types/payment.types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: 'CREDIT_CARD',
    cardNumber: '',
    cvv: '',
    expiryMonth: '',
    expiryYear: '',
    upiId: '',
    walletProvider: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const paymentRequest = {
        bookingId: booking.id,
        amount: booking.totalAmount,
        paymentMethod: selectedMethod,
        currency: 'INR',
        ...(selectedMethod === 'CREDIT_CARD' || selectedMethod === 'DEBIT_CARD' ? {
          cardNumber: formData.cardNumber,
          cvv: formData.cvv,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
        } : {}),
        ...(selectedMethod === 'UPI' ? {
          upiId: formData.upiId,
        } : {}),
        ...(selectedMethod === 'WALLET' ? {
          walletProvider: formData.walletProvider,
        } : {}),
      };

      await paymentApi.processPayment(paymentRequest);
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
    { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
    { id: 'UPI', label: 'UPI', icon: Smartphone },
    { id: 'WALLET', label: 'Wallet', icon: Wallet },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
          <p className="text-lg font-semibold">Amount: ₹{booking.totalAmount}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map(method => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                  className={`p-3 border rounded flex items-center justify-center gap-2 transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handlePayment}>
          {(selectedMethod === 'CREDIT_CARD' || selectedMethod === 'DEBIT_CARD') && (
            <div className="space-y-3 mb-4">
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                maxLength={16}
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  className="p-2 border rounded"
                  maxLength={3}
                  required
                />
                <input
                  type="text"
                  name="expiryMonth"
                  placeholder="MM"
                  value={formData.expiryMonth}
                  onChange={handleInputChange}
                  className="p-2 border rounded"
                  maxLength={2}
                  required
                />
                <input
                  type="text"
                  name="expiryYear"
                  placeholder="YY"
                  value={formData.expiryYear}
                  onChange={handleInputChange}
                  className="p-2 border rounded"
                  maxLength={2}
                  required
                />
              </div>
            </div>
          )}

          {selectedMethod === 'UPI' && (
            <div className="mb-4">
              <input
                type="text"
                name="upiId"
                placeholder="UPI ID (e.g., yourname@upi)"
                value={formData.upiId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )}

          {selectedMethod === 'WALLET' && (
            <div className="mb-4">
              <select
                name="walletProvider"
                value={formData.walletProvider}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Wallet</option>
                <option value="PAYTM">Paytm</option>
                <option value="PHONEPE">PhonePe</option>
                <option value="GOOGLEPAY">Google Pay</option>
                <option value="AMAZONPAY">Amazon Pay</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ₹${booking.totalAmount}`}
          </button>
        </form>
      </div>
    </div>
  );
};