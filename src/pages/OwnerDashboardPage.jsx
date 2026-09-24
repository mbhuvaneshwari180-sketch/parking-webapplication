import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, parkingAPI } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  Building2, 
  DollarSign, 
  Car, 
  Ticket, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  ArrowRight,
  ParkingCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await analyticsAPI.getOwnerAnalytics();
        setData(res.data.data);
      } catch (err) {
        setError('Failed to fetch facility operations telemetry');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const summary = data?.summary || {
    totalParkings: 0,
    totalSlots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    occupancyRate: 0,
    totalBookingsCount: 0,
    totalRevenue: 0,
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading facility metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live"></span>
            Facility Operator Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Owner Command Center</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time telemetry, bay management, and commercial monetization overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/owner/analytics"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Detailed Analytics</span>
          </Link>

          <Link
            to="/owner/parkings"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Locations & Bays</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={`$${summary.totalRevenue.toFixed(2)}`}
          subtext="Total processed customer bookings"
          icon={DollarSign}
          trend="+18.4%"
          color="emerald"
        />
        <StatCard
          title="Live Occupancy"
          value={`${summary.occupancyRate}%`}
          subtext={`${summary.occupiedSlots} of ${summary.totalSlots} bays active`}
          icon={Car}
          color="brand"
        />
        <StatCard
          title="Total Reservations"
          value={summary.totalBookingsCount}
          subtext="Lifetime digital passes issued"
          icon={Ticket}
          trend="+12%"
          color="purple"
        />
        <StatCard
          title="Garages Managed"
          value={summary.totalParkings}
          subtext={`${summary.availableSlots} slots ready for reservation`}
          icon={Building2}
          color="amber"
        />
      </div>

      {/* Quick Actions & Recent Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reservations Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-400" />
              Recent Stall Reservations
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Inflow</span>
          </div>

          {!data?.recentReservations || data.recentReservations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No reservation activity yet. Slots will show here when commuters reserve bays.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Bay</th>
                    <th className="py-3 px-4">Time Window</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.recentReservations.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{r.user?.name || 'Anonymous'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">{r.slot?.code}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">${r.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Operational Highlights Box */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Operational Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add new facilities, configure vehicle types, modify hourly pricing tiers, and monitor real-time sensor sync.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                to="/owner/parkings"
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-600 text-xs font-semibold text-slate-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Manage Parking Locations</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
              </Link>

              <Link
                to="/owner/analytics"
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-600 text-xs font-semibold text-slate-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Peak-Hour Utilization Charts</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-sky-400 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
