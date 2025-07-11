import React from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, DollarSign } from 'lucide-react';
import type { PaymentStatus as PaymentStatusType } from '../types/payment.types';

interface PaymentStatusProps {
  status: PaymentStatusType;
  amount?: number;
  transactionId?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, amount, transactionId }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'FAILED':
        return <XCircle className="text-red-500" size={20} />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="text-yellow-500" size={20} />;
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return <RefreshCw className="text-blue-500" size={20} />;
      default:
        return <DollarSign className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PENDING':
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-50';
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'SUCCESS':
        return 'Payment Successful';
      case 'FAILED':
        return 'Payment Failed';
      case 'PENDING':
        return 'Payment Pending';
      case 'PROCESSING':
        return 'Processing Payment';
      case 'REFUNDED':
        return 'Refunded';
      case 'PARTIALLY_REFUNDED':
        return 'Partially Refunded';
      default:
        return status;
    }
  };

  return (
    <div className={`rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
        {amount && (
          <span className="font-semibold">₹{amount.toFixed(2)}</span>
        )}
      </div>
      {transactionId && status === 'SUCCESS' && (
        <p className="text-sm mt-2 opacity-75">
          Transaction ID: {transactionId}
        </p>
      )}
    </div>
  );
};