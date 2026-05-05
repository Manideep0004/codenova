import React from 'react';

export default function Admin() {
  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-6">Admin Dashboard</h1>
      <div className="bg-dark p-6 rounded border border-gray-800 flex-1">
        <p>Welcome to the Admin Dashboard. Only authorized personnel can see this.</p>
        <p className="mt-4 text-gray-400">Future implementations will include system metrics and user management.</p>
      </div>
    </div>
  );
}
