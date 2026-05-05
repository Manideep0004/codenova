import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-primary mb-6">Codenova</h1>
      <p className="text-xl mb-10 max-w-2xl text-center">
        The ultimate cloud-based code execution platform. Write, compile, and run code in multiple languages instantly from your browser.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded text-white font-medium">Login</Link>
        <Link to="/register" className="px-6 py-3 bg-primary hover:bg-blue-600 rounded text-white font-medium">Get Started</Link>
      </div>
    </div>
  );
}
