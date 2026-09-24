import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// 18 Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import ParkingDetailsPage from './pages/ParkingDetailsPage';
import SlotSelectionPage from './pages/SlotSelectionPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import TicketPage from './pages/TicketPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import ParkingManagementPage from './pages/ParkingManagementPage';
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import MasterDashboardPage from './pages/MasterDashboardPage';
import AuditLogViewerPage from './pages/AuditLogViewerPage';

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-2xl font-bold">
        404
      </div>
      <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested path does not exist in the ParkingSpot urban grid.
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
      >
        Return to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/parkings" element={<SearchPage />} />
              <Route path="/parkings/:id" element={<ParkingDetailsPage />} />
              <Route path="/parkings/:id/slots" element={<SlotSelectionPage />} />

              {/* Commuter / Authenticated Routes */}
              <Route
                path="/book/:slotId"
                element={
                  <ProtectedRoute allowedRoles={['COMMUTER', 'OWNER', 'ADMIN', 'MASTER_ADMIN']}>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={['COMMUTER', 'OWNER', 'ADMIN', 'MASTER_ADMIN']}>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={['COMMUTER', 'OWNER', 'ADMIN', 'MASTER_ADMIN']}>
                    <ConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ticket/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={['COMMUTER', 'OWNER', 'ADMIN', 'MASTER_ADMIN']}>
                    <TicketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={['COMMUTER', 'OWNER', 'ADMIN', 'MASTER_ADMIN']}>
                    <BookingHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Owner Routes */}
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'ADMIN', 'MASTER_ADMIN']}>
                    <OwnerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/parkings"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'ADMIN', 'MASTER_ADMIN']}>
                    <ParkingManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/analytics"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'ADMIN', 'MASTER_ADMIN']}>
                    <OwnerAnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MASTER_ADMIN']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Master Admin Routes (Exclusive) */}
              <Route
                path="/master/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['MASTER_ADMIN']}>
                    <MasterDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/master/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['MASTER_ADMIN']}>
                    <AuditLogViewerPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
