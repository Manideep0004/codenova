import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Users, Activity, Layers, CheckCircle2, Shield, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Admin() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const [metricsRes, usersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users')
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleToggle = async (userId, currentRoleId) => {
    const newRoleId = currentRoleId === 1 ? 2 : 1;
    try {
      await api.put(`/admin/users/${userId}/role`, { roleId: newRoleId });
      setActionMessage({ type: 'success', text: `User #${userId} role updated successfully.` });
      // Refresh user table
      setUsers(users.map(u => u.id === userId ? { ...u, roleId: newRoleId, role: newRoleId === 1 ? 'admin' : 'user' } : u));
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update user role' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Link to="/editor" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition">
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>CodeNova Administration & Telemetry</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">RBAC Secured</span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-11">FR-07 User Governance & FR-08 System Metrics Telemetry</p>
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-200 hover:text-white transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300' 
              : 'bg-rose-950/40 border border-rose-800 text-rose-300'
          }`}>
            {actionMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Registered Users</span>
              <Users size={18} className="text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {metrics ? metrics.overview.totalUsers : '—'}
            </div>
            <span className="text-[11px] text-gray-500">Active accounts in PostgreSQL</span>
          </div>

          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Total Submissions</span>
              <Activity size={18} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {metrics ? metrics.overview.totalSubmissions : '—'}
            </div>
            <span className="text-[11px] text-gray-500">Cumulative executions</span>
          </div>

          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Success Rate</span>
              <CheckCircle2 size={18} className="text-teal-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {metrics ? metrics.overview.successRate : '—'}
            </div>
            <span className="text-[11px] text-gray-500">Exit code 0 ratio</span>
          </div>

          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Active Queue Depth</span>
              <Layers size={18} className="text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {metrics ? (metrics.queue.waiting + metrics.queue.active) : '0'}
            </div>
            <span className="text-[11px] text-gray-500">Redis Bull pending jobs</span>
          </div>
        </div>

        {/* Middle Section: Execution Breakdown by Language */}
        {metrics && metrics.languages && (
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 mb-8 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Execution Volume By Runtime Environment
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
              {metrics.languages.map((item, idx) => (
                <div key={idx} className="bg-[#0d1117] border border-gray-800 p-3 rounded-lg">
                  <span className="text-xs text-gray-400">{item.language}</span>
                  <div className="text-lg font-bold text-indigo-400 mt-1">{item.count} runs</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Governance Table */}
        <div className="bg-[#161b22] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-[#21262d] flex justify-between items-center">
            <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Shield size={16} className="text-indigo-400" />
              <span>User Governance & Access Control (FR-07)</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">{users.length} Users Enrolled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1f242c] border-b border-gray-800 text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Username</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Submissions</th>
                  <th className="py-3 px-6">Enrolled At</th>
                  <th className="py-3 px-6 text-right">Access Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                {users.map((u) => {
                  const isAdminUser = u.role === 'admin' || u.roleId === 1;
                  return (
                    <tr key={u.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-6 font-bold text-gray-400">#{u.id}</td>
                      <td className="py-3.5 px-6 font-semibold text-white">{u.username}</td>
                      <td className="py-3.5 px-6 text-gray-300 font-sans">{u.email}</td>
                      <td className="py-3.5 px-6">
                        {isAdminUser ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            USER
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-indigo-400 font-bold">{u.submissionCount}</td>
                      <td className="py-3.5 px-6 text-gray-400 font-sans text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-6 text-right font-sans">
                        <button
                          onClick={() => handleRoleToggle(u.id, u.roleId)}
                          className={`text-xs px-3 py-1 rounded transition font-medium ${
                            isAdminUser 
                              ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/50' 
                              : 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/50'
                          }`}
                        >
                          {isAdminUser ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
