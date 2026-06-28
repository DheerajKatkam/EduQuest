import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import GamePlay from './pages/GamePlay';
import Social from './pages/Social';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import { Loader2 } from 'lucide-react';

// Route protection wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin text-brand-purple mb-4" />
        <p className="font-display font-medium">Validating character session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect if already authenticated
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin text-brand-purple mb-4" />
        <p className="font-display font-medium">Verifying portal status...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function MainAppLayout() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col font-sans select-none text-gray-200">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          } 
        />

        {/* Protected Gameplay and Social routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/play/:levelId" 
          element={
            <ProtectedRoute>
              <GamePlay />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/social" 
          element={
            <ProtectedRoute>
              <Social />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SoundProvider>
        <AuthProvider>
          <MainAppLayout />
        </AuthProvider>
      </SoundProvider>
    </BrowserRouter>
  );
}
