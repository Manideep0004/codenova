import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, X, Clock, Cpu, CheckCircle2, XCircle } from 'lucide-react';

export default function History() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/submissions/history?page=${page}&limit=10`);
      setSubmissions(res.data.submissions || []);
      setPagination(res.data.pagination || { currentPage: page, totalPages: 1, totalItems: 0 });
    } catch (err) {
      console.error('Failed to load submission history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

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
              <h1 className="text-2xl font-bold text-white tracking-tight">Submission History</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-11">Historical audit log of executed workloads and container sandboxes</p>
          </div>

          <Link
            to="/editor"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold text-white transition shadow-md shadow-indigo-600/20"
          >
            Launch Editor
          </Link>
        </div>

        {/* Submissions Table */}
        <div className="bg-[#161b22] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#21262d] border-b border-gray-800 text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4">Submission ID</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Runtime (ms)</th>
                  <th className="py-3.5 px-4">Memory</th>
                  <th className="py-3.5 px-4">Exit Code</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                      <p className="mt-2 text-xs">Retrieving submission logs...</p>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
                      No code execution submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-indigo-400">#{sub.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-medium">
                          {sub.language?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 size={12} /> SUCCESS
                          </span>
                        ) : sub.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            <XCircle size={12} /> FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {sub.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{sub.result?.executionTime ? `${sub.result.executionTime} ms` : '—'}</td>
                      <td className="py-3.5 px-4 text-gray-300">{sub.result?.memoryUsed ? `${sub.result.memoryUsed} KB` : '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${sub.result?.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sub.result?.exitCode ?? '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 font-sans text-xs">
                        {new Date(sub.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition text-xs font-sans"
                        >
                          <Eye size={12} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-t border-gray-800 text-xs text-gray-400 font-sans">
            <div>
              Showing page <strong className="text-white">{pagination.currentPage}</strong> of <strong className="text-white">{pagination.totalPages || 1}</strong> ({pagination.totalItems} total records)
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.currentPage <= 1 || loading}
                onClick={() => fetchHistory(pagination.currentPage - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                onClick={() => fetchHistory(pagination.currentPage + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal: View Details */}
        {selectedSub && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#161b22] border border-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#21262d]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Submission #{selectedSub.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                    {selectedSub.language?.name}
                  </span>
                </div>
                <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {/* Source Code */}
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Executed Source Code</span>
                  <pre className="bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-xs font-mono text-emerald-300 whitespace-pre-wrap mt-1 overflow-x-auto">
                    {selectedSub.code}
                  </pre>
                </div>

                {/* Stdin Data */}
                {selectedSub.stdinData && (
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Standard Input (stdin)</span>
                    <pre className="bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-xs font-mono text-gray-300 whitespace-pre-wrap mt-1">
                      {selectedSub.stdinData}
                    </pre>
                  </div>
                )}

                {/* Stdout Output */}
                {selectedSub.result?.stdout && (
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">STDOUT Output</span>
                    <pre className="bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-xs font-mono text-emerald-400 whitespace-pre-wrap mt-1">
                      {selectedSub.result.stdout}
                    </pre>
                  </div>
                )}

                {/* Stderr Output */}
                {selectedSub.result?.stderr && (
                  <div>
                    <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">STDERR Output</span>
                    <pre className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3 text-xs font-mono text-rose-300 whitespace-pre-wrap mt-1">
                      {selectedSub.result.stderr}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
