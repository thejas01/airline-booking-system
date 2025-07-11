import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, CreditCard, User, LogOut, Home, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <Plane className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">FlightBooker</span>
              </Link>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Home className="mr-1" size={16} />
                Home
              </Link>
              
              <Link
                to="/flights"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/flights') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Plane className="mr-1" size={16} />
                Flights
              </Link>
              
              <Link
                to="/bookings"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/bookings') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CreditCard className="mr-1" size={16} />
                My Bookings
              </Link>
              
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/dashboard') 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="mr-1" size={16} />
                Profile
              </Link>
              
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname.startsWith('/admin')
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Shield className="mr-1" size={16} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{user.name}</span>
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              user.role === 'ADMIN' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="mr-1" size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              isActive('/') 
                ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="inline mr-2" size={16} />
            Home
          </Link>
          <Link
            to="/flights"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              isActive('/flights') 
                ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plane className="inline mr-2" size={16} />
            Flights
          </Link>
          <Link
            to="/bookings"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              isActive('/bookings') 
                ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="inline mr-2" size={16} />
            My Bookings
          </Link>
          <Link
            to="/dashboard"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              isActive('/dashboard') 
                ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User className="inline mr-2" size={16} />
            Profile
          </Link>
          
          {user.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname.startsWith('/admin')
                  ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield className="inline mr-2" size={16} />
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};