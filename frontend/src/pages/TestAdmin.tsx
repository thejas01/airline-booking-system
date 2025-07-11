import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAdmin: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
        {user && (
          <>
            <p><strong>User Name:</strong> {user.name}</p>
            <p><strong>User Email:</strong> {user.email}</p>
            <p><strong>User Role:</strong> {user.role}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </>
        )}
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            If isAdmin is false but you expect it to be true, check:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>JWT token contains role: 'ADMIN'</li>
            <li>User was promoted to admin in the database</li>
            <li>You've logged out and logged back in after role change</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestAdmin;