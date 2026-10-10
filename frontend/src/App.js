import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Editor from './pages/Editor';
import History from './pages/History';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0d14] text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0d14] text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  const isAdmin = user && (user.role === 'admin' || user.roleId === 1 || user.username === 'admin');
  return isAdmin ? children : <Navigate to="/editor" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0d14] text-slate-200 antialiased selection:bg-indigo-500 selection:text-white">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/editor" element={
              <ProtectedRoute><Editor /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><History /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute><Admin /></AdminRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
