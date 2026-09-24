import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ParkingCircle, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUser = (user) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (user.role === 'MASTER_ADMIN') {
      navigate('/master/dashboard');
    } else if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (user.role === 'OWNER') {
      navigate('/owner/dashboard');
    } else {
      navigate('/parkings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectUser(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await demoLogin(role);
      redirectUser(user);
    } catch (err) {
      setError('Failed to log in with demo account. Ensure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <ParkingCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in to ParkingSpot</h2>
          <p className="text-xs text-slate-400">Access real-time parking reservations and facilities</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Quick Demo Switcher */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Instant Demo Sign-in
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('COMMUTER')}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-sky-900/40 border border-slate-700 hover:border-sky-600 text-xs font-semibold text-sky-300 transition-colors text-left"
            >
              🚗 Commuter
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('OWNER')}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-900/40 border border-slate-700 hover:border-emerald-600 text-xs font-semibold text-emerald-300 transition-colors text-left"
            >
              🏢 Owner
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('ADMIN')}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-600 text-xs font-semibold text-blue-300 transition-colors text-left"
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('MASTER_ADMIN')}
              className="py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700 text-xs font-bold text-purple-200 transition-colors text-left shadow-sm"
            >
              👑 Master Admin
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 text-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 text-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
