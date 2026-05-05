import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function History() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await api.get('/submissions/history');
      setSubmissions(res.data);
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Submission History</h1>
        <Link to="/editor" className="bg-gray-800 p-2 rounded hover:bg-gray-700">Back to Editor</Link>
      </div>
      <div className="bg-dark rounded overflow-hidden shadow-lg border border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-darker border-b border-gray-800">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Language</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub.id} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="p-4">#{sub.id}</td>
                <td className="p-4">{sub.language.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    sub.status === 'completed' ? 'bg-green-900 text-green-300' :
                    sub.status === 'failed' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">{new Date(sub.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr><td colSpan="4" className="p-4 text-center">No submissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
