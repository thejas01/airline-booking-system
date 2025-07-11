import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { ArrowRight, Shield, User, Plane, CreditCard, Calendar } from 'lucide-react';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isLoaded: bgLoaded } = useImagePreloader('/airplane-bg-optimized.jpg');

  return (
    <div 
      className={`min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat relative transition-opacity duration-500 ${
        bgLoaded ? 'opacity-100' : 'opacity-90'
      }`}
      style={{
        backgroundImage: bgLoaded ? 'url(/airplane-bg-optimized.jpg)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            Flight Booking System
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Book flights with ease using our secure booking platform built with Spring Boot microservices and React
          </p>
          
          <div className="mt-10 flex justify-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/flights"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plane className="mr-2 h-5 w-5" />
                  Book Flights
                </Link>
                <Link
                  to="/bookings"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  My Bookings
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <User className="mr-2 h-5 w-5" />
                  Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="py-12">
          <div className="bg-white bg-opacity-90 rounded-lg p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex justify-center">
                  <Plane className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Flight Search & Booking</h3>
                <p className="mt-2 text-base text-gray-600">
                  Search for flights by destination, date, and book your preferred seats instantly
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center">
                  <Calendar className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Booking Management</h3>
                <p className="mt-2 text-base text-gray-600">
                  View, manage, and cancel your flight bookings with complete booking history
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Secure Platform</h3>
                <p className="mt-2 text-base text-gray-600">
                  Built with microservices architecture and JWT authentication for maximum security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};