import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Terminal, Shield, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      loginUser(res.data.token, res.data.user);
      navigate('/editor');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-xl shadow-indigo-600/30 mb-3">
            <Terminal size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Sign in to CodeNova</h1>
          <p className="text-xs text-gray-400 mt-1">Cloud-Native Code Execution Sandbox</p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="bg-[#161b22] border border-indigo-900/50 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Shield size={14} /> Teacher / Evaluator Quick Demo
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@codenova.io', 'Admin@123')}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 transition"
            >
              👑 Fill Admin Login
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('manideep@codenova.io', 'User@123')}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition"
            >
              👤 Fill Student Login
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
