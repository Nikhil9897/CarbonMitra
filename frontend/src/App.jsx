import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ActivityLogging from './pages/ActivityLogging';
import Goals from './pages/Goals';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Certificate from './pages/Certificate';
import OrganizationDashboard from './pages/OrganizationDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RoutePlanner from './pages/RoutePlanner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Protected Main Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/log-activity" element={
            <ProtectedRoute>
              <Layout><ActivityLogging /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute>
              <Layout><Goals /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Layout><Leaderboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout><Analytics /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/certificate" element={
            <ProtectedRoute>
              <Layout><Certificate /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/route-planner" element={
            <ProtectedRoute>
              <Layout><RoutePlanner /></Layout>
            </ProtectedRoute>
          } />

          {/* Org Admin Route */}
          <Route path="/organization-dashboard" element={
            <ProtectedRoute allowedRoles={['ROLE_ORGANIZATION_ADMIN', 'ROLE_ADMIN']}>
              <Layout><OrganizationDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin Route */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* React Toast notifications */}
        <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="colored"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
