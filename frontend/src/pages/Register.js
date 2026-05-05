import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleRegister} className="bg-dark p-8 rounded shadow-lg w-96 border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Register</h2>
        {error && <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm mb-1">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required 
                 className="w-full p-2 bg-darker border border-gray-700 rounded text-white focus:outline-none focus:border-primary" />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required 
                 className="w-full p-2 bg-darker border border-gray-700 rounded text-white focus:outline-none focus:border-primary" />
        </div>
        <div className="mb-6">
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required 
                 className="w-full p-2 bg-darker border border-gray-700 rounded text-white focus:outline-none focus:border-primary" />
        </div>
        <button type="submit" className="w-full bg-primary hover:bg-blue-600 p-2 rounded text-white font-bold">Register</button>
        <div className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-primary">Login</Link>
        </div>
      </form>
    </div>
  );
}
