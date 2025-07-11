import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, type BookingStatistics, type AdminBooking } from '../api/admin.api';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<BookingStatistics | null>(null);
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([]);
  const [revenueByDate, setRevenueByDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, recent, revenue] = await Promise.all([
        adminApi.getBookingStatistics(),
        adminApi.getRecentBookings(5),
        adminApi.getRevenueByDate(7)
      ]);
      
      setStatistics(stats);
      setRecentBookings(recent);
      setRevenueByDate(revenue);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Total Bookings
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {statistics?.totalBookings || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Total Revenue
            </div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {formatCurrency(statistics?.totalRevenue || 0)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Today's Bookings
            </div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {statistics?.todayBookings || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Monthly Revenue
            </div>
            <div className="mt-2 text-3xl font-bold text-purple-600">
              {formatCurrency(statistics?.monthlyRevenue || 0)}
            </div>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confirmed</span>
                <span className="font-semibold text-green-600">
                  {statistics?.confirmedBookings || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {statistics?.pendingBookings || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelled</span>
                <span className="font-semibold text-red-600">
                  {statistics?.cancelledBookings || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue (Last 7 Days)</h2>
            <div className="space-y-2">
              {Object.entries(revenueByDate).slice(0, 7).map(([date, amount]) => (
                <div key={date} className="flex justify-between items-center">
                  <span className="text-gray-600">{formatDate(date)}</span>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Flight #{booking.flightId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(booking.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : ''}
                        ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                        ${booking.status === 'PAID' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.bookingDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => navigate('/admin/bookings')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Manage All Bookings
          </button>
          <button
            onClick={() => navigate('/admin/flights')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Manage Flights
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Manage Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;