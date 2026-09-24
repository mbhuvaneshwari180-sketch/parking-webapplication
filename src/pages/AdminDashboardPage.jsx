import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Car, 
  DollarSign, 
  ArrowRight, 
  UserCheck, 
  Activity,
  Layers
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, parkingsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getParkings(),
        ]);
        setStats(statsRes.data.data);
        setParkings(parkingsRes.data.data);
      } catch (err) {
        setError('Failed to load municipal administrative telemetry');
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading municipal command grid...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-xs text-blue-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            City Administrative Authority
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Municipal Operations Command</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Platform governance, user verification, and urban infrastructure monitoring.
          </p>
        </div>

        <Link
          to="/admin/users"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
        >
          <UserCheck className="w-4 h-4" />
          <span>User & Role Governance</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Platform Users"
          value={stats?.totalUsers || 0}
          subtext="Commuters & Verified Owners"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Active Garages"
          value={stats?.totalParkings || 0}
          subtext="Regulated urban facilities"
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Total Bays Monitored"
          value={stats?.totalSlots || 0}
          subtext={`${stats?.availableSlots || 0} currently open`}
          icon={Car}
          color="amber"
        />
        <StatCard
          title="Gross Network Volume"
          value={`₹${(stats?.totalRevenue || 0).toFixed(2)}`}
          subtext="Across all terminal nodes"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Facilities Across the City Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Registered Municipal Parking Facilities
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {parkings.length} Garages Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Garage Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Facility Owner</th>
                <th className="py-3 px-4">Total Bays</th>
                <th className="py-3 px-4">Total Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {parkings.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                  <td className="py-3 px-4 text-slate-400">{p.city} ({p.address})</td>
                  <td className="py-3 px-4 text-slate-300">{p.owner?.name} ({p.owner?.email})</td>
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">{p._count?.slots || 0}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">{p._count?.bookings || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
