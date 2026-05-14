import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      const meRes = await api.get('/auth/me');
      setUser(meRes.data);
      navigate('/editor');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="bg-dark p-8 rounded shadow-lg w-96 border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Login to Codenova</h2>
        {error && <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">{error}</div>}
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
        <button type="submit" className="w-full bg-primary hover:bg-blue-600 p-2 rounded text-white font-bold">Login</button>
        <div className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/register" className="text-primary">Register</Link>
        </div>
      </form>
    </div>
  );
}
