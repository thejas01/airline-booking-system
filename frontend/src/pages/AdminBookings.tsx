import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, type PaginatedResponse, type AdminBooking } from '../api/admin.api';

const AdminBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<PaginatedResponse<AdminBooking> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [currentPage, sortBy, sortDirection]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllBookings(currentPage, pageSize, sortBy, sortDirection);
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await adminApi.searchBookings({
        userEmail: searchEmail || undefined,
        status: searchStatus || undefined
      });
      setBookings({
        content: results,
        totalElements: results.length,
        totalPages: 1,
        size: results.length,
        number: 0
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      await adminApi.updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await adminApi.cancelBooking(bookingId);
        fetchBookings();
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Manage Bookings</h1>
          
          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Email
                </label>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PAID">Paid</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSortBy('id');
                        setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
                      }}
                    >
                      ID {sortBy === 'id' && (sortDirection === 'ASC' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seats
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSortBy('totalPrice');
                        setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
                      }}
                    >
                      Price {sortBy === 'totalPrice' && (sortDirection === 'ASC' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSortBy('bookingDate');
                        setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
                      }}
                    >
                      Date {sortBy === 'bookingDate' && (sortDirection === 'ASC' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings?.content.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.userEmail || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Flight #{booking.flightId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.numberOfSeats || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(booking.totalPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={booking.status || 'PENDING'}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border
                            ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                            ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                            ${booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                            ${booking.status === 'PAID' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                          `}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PAID">Paid</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(booking.bookingDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {bookings && bookings.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage + 1} of {bookings.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(bookings.totalPages - 1, currentPage + 1))}
                    disabled={currentPage === bookings.totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => navigate('/admin')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminBookings;