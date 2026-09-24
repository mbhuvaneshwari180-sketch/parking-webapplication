import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Ticket, 
  LayoutDashboard, 
  ShieldCheck, 
  Crown, 
  LogOut, 
  Menu, 
  X, 
  ParkingCircle, 
  BarChart3, 
  FileText,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isOwner, isAdmin, isMasterAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ParkingCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                ParkingSpot
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 font-medium border border-slate-700">
                Smart City
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/parkings"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/parkings')
                  ? 'bg-brand-600/20 text-sky-300 border border-brand-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Find Parking
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive('/my-bookings')
                    ? 'bg-brand-600/20 text-sky-300 border border-brand-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Bookings
              </Link>
            )}

            {/* Owner Section */}
            {(isOwner || isAdmin || isMasterAdmin) && (
              <div className="relative group">
                <Link
                  to="/owner/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    location.pathname.startsWith('/owner')
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Owner Hub
                </Link>
              </div>
            )}

            {/* Admin Section */}
            {(isAdmin || isMasterAdmin) && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-blue-950/40 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-blue-400 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* Master Admin Section (Highest Privilege Purple Theme) */}
            {isMasterAdmin && (
              <Link
                to="/master/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  location.pathname.startsWith('/master')
                    ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-purple-500/20 shadow-lg'
                    : 'bg-purple-950/40 text-purple-300 border border-purple-800 hover:bg-purple-900/40 hover:text-purple-100'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Master Admin
              </Link>
            )}
          </nav>

          {/* Right Action / User State */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        user?.role === 'MASTER_ADMIN'
                          ? 'bg-purple-900/80 text-purple-300 border border-purple-700 shadow-xs'
                          : user?.role === 'ADMIN'
                          ? 'bg-blue-900/80 text-blue-300 border border-blue-700'
                          : user?.role === 'OWNER'
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                          : 'bg-sky-900/80 text-sky-300 border border-sky-700'
                      }`}
                    >
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm hover:shadow-glow-primary transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/parkings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            <Compass className="w-5 h-5 text-sky-400" />
            Find Parking
          </Link>

          {isAuthenticated && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
            >
              <Ticket className="w-5 h-5 text-sky-400" />
              My Bookings
            </Link>
          )}

          {(isOwner || isAdmin || isMasterAdmin) && (
            <>
              <Link
                to="/owner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:bg-slate-800"
              >
                <LayoutDashboard className="w-5 h-5" />
                Owner Dashboard
              </Link>
              <Link
                to="/owner/parkings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:bg-slate-800"
              >
                <ParkingCircle className="w-5 h-5" />
                Manage Locations
              </Link>
              <Link
                to="/owner/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:bg-slate-800"
              >
                <BarChart3 className="w-5 h-5" />
                Occupancy Analytics
              </Link>
            </>
          )}

          {(isAdmin || isMasterAdmin) && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:bg-slate-800"
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Dashboard
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:bg-slate-800"
              >
                <UserCheck className="w-5 h-5" />
                User Management
              </Link>
            </>
          )}

          {isMasterAdmin && (
            <>
              <Link
                to="/master/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-purple-300 bg-purple-950/60 border border-purple-800"
              >
                <Crown className="w-5 h-5 text-amber-400" />
                Master Admin Console
              </Link>
              <Link
                to="/master/audit-logs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-purple-300 hover:bg-slate-800"
              >
                <FileText className="w-5 h-5" />
                Audit Log Viewer
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3">
                  <div className="font-semibold text-slate-200">{user?.name}</div>
                  <div className="text-xs text-sky-400">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-rose-900/40 text-rose-300 border border-rose-800"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2 rounded-md bg-slate-800 text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2 rounded-md bg-brand-600 text-white font-semibold"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
