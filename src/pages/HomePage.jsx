import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  Radio, 
  QrCode, 
  Clock, 
  Car, 
  ChevronRight, 
  Sparkles,
  TrendingUp,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();
  const { demoLogin, isAuthenticated } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('query', searchQuery.trim());
    if (selectedCity) params.append('city', selectedCity);
    navigate(`/parkings?${params.toString()}`);
  };

  const quickCities = ['San Francisco', 'New York', 'Seattle', 'Bangalore'];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          {/* Top announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs text-sky-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live"></span>
            <span className="font-semibold">Smart Urban Grid v2.6 Active</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Stateless Polling (3s refresh)</span>
          </div>

          {/* Mandatory Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Find, Reserve & Manage <br />
            <span className="bg-gradient-to-r from-sky-400 via-brand-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              Parking in Real Time
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Eliminate parking scarcity with intelligent sensor integration, instant guaranteed reservations, dynamic vehicle routing, and automated digital QR ticketing.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto bg-slate-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row gap-3 items-center"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, area or parking name"
                className="w-full bg-slate-800/80 text-white pl-11 pr-4 py-3 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-slate-400"
              />
            </div>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full sm:w-44 bg-slate-800/80 text-white px-3.5 py-3 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="">All Metros</option>
              {quickCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              Search
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Popular Metro Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <span className="font-semibold text-slate-400">Popular Hubs:</span>
            {quickCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => navigate(`/parkings?city=${encodeURIComponent(city)}`)}
                className="px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-brand-400" />
                {city}
              </button>
            ))}
          </div>

          {/* Quick Demo Access Bar */}
          {!isAuthenticated && (
            <div className="pt-8 border-t border-slate-800/80 max-w-2xl mx-auto">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
                Instant 1-Click Role Sandbox Logins:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => demoLogin('COMMUTER').then(() => navigate('/parkings'))}
                  className="px-3 py-2 rounded-xl bg-sky-950/40 border border-sky-800 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 transition-all"
                >
                  🚗 Commuter
                </button>
                <button
                  type="button"
                  onClick={() => demoLogin('OWNER').then(() => navigate('/owner/dashboard'))}
                  className="px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-all"
                >
                  🏢 Owner
                </button>
                <button
                  type="button"
                  onClick={() => demoLogin('ADMIN').then(() => navigate('/admin/dashboard'))}
                  className="px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-800 text-xs font-semibold text-blue-300 hover:bg-blue-900/60 transition-all"
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  onClick={() => demoLogin('MASTER_ADMIN').then(() => navigate('/master/dashboard'))}
                  className="px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-700 text-xs font-bold text-purple-200 hover:bg-purple-900/80 transition-all shadow-sm shadow-purple-500/20"
                >
                  👑 Master Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Core Flow Feature Walkthrough */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Streamlined Workflow</span>
          <h2 className="text-3xl font-extrabold text-white">How ParkingSpot Works</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From search to spot reservation in under 60 seconds with frictionless digital verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-bold">
              1
            </div>
            <h3 className="font-bold text-white text-lg">Search & Filter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore city terminals with real-time slot counters. Filter specifically by CAR, BIKE, or EV Charging stalls.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-bold">
              2
            </div>
            <h3 className="font-bold text-white text-lg">Live Slot Selection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive bay grid refreshed every 3 seconds. See available slots change live as other drivers check in.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-bold">
              3
            </div>
            <h3 className="font-bold text-white text-lg">Instant Reservation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose parking duration. Atomic Prisma database locking prevents double-booking disputes instantly.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-bold">
              4
            </div>
            <h3 className="font-bold text-white text-lg">Digital QR Pass</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive a cryptographically secure token and high-density QR code for automated barrier clearance.
            </p>
          </div>
        </div>
      </section>

      {/* Role Feature Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Every Stakeholder</h2>
            <p className="text-sm text-slate-400">Complete role-based management across urban transit networks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Commuter */}
            <div className="space-y-4 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Commuter</h3>
                  <p className="text-xs text-slate-400">Drivers & Motorists</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-400" /> Real-time search across cities</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-400" /> Vehicle-specific filtering (EV/CAR/BIKE)</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-400" /> Server-generated digital QR tickets</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-400" /> Transparent automated refunds on cancellation</li>
              </ul>
              <Link
                to="/parkings"
                className="block text-center py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-colors"
              >
                Find Parking Now
              </Link>
            </div>

            {/* Owner */}
            <div className="space-y-4 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Facility Owner</h3>
                  <p className="text-xs text-slate-400">Garage Operators</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Cloudinary signed photo uploads</li>
                <li className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Dynamic bay pricing & status control</li>
                <li className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Peak-hour utilization & revenue charts</li>
                <li className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Occupancy analytics & booking logs</li>
              </ul>
              <Link
                to="/owner/dashboard"
                className="block text-center py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
              >
                Access Owner Hub
              </Link>
            </div>

            {/* Master Admin */}
            <div className="space-y-4 p-6 rounded-2xl bg-purple-950/30 border border-purple-800/70 shadow-lg shadow-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-900 border border-purple-700 text-purple-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Master Admin</h3>
                  <p className="text-xs text-purple-300">Super-Admin Authority</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-purple-200">
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> Full CRUD across all platform entities</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> Role promotions & user suspensions</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> Manual booking & payment overrides</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> Immutable audit logging of all actions</li>
              </ul>
              <Link
                to="/master/dashboard"
                className="block text-center py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-600/30 transition-colors"
              >
                Open Master Console
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
