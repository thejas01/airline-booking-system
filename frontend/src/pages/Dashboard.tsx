import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { User, Mail, Shield, Trash2, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const { isLoaded: bgLoaded } = useImagePreloader('/profile-bg-optimized.jpg');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');


  const handleDeleteAccount = async () => {
    setError('');
    setIsDeleting(true);
    
    try {
      await deleteAccount();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat relative transition-opacity duration-500 ${
        bgLoaded ? 'opacity-100' : 'opacity-90'
      }`}
      style={{
        backgroundImage: bgLoaded ? 'url(/profile-bg-optimized.jpg)' : 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white bg-opacity-90 overflow-hidden shadow rounded-lg backdrop-blur-sm">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
              
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.name || 'N/A'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Role
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.role}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-white bg-opacity-90 overflow-hidden shadow rounded-lg backdrop-blur-sm">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <div className="mt-5">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-red-600">
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>
                    <div className="space-x-4">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};