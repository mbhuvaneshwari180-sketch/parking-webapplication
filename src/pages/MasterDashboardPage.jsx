import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { masterAPI, bookingAPI } from '../services/api';
import StatCard from '../components/StatCard';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Crown, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  Building2, 
  Car, 
  Ticket, 
  FileText, 
  Sliders, 
  AlertTriangle, 
  Power, 
  RefreshCw, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  RotateCcw
} from 'lucide-react';

export default function MasterDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Manual Override Form State
  const [overrideBookingId, setOverrideBookingId] = useState('');
  const [overrideAction, setOverrideAction] = useState('FORCE_REFUND');
  const [overrideNote, setOverrideNote] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState('');
  const [overrideError, setOverrideError] = useState('');

  // Confirmation modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    action: null,
  });

  const fetchMasterData = async () => {
    try {
      const [ovRes, setRes] = useState ? await Promise.all([masterAPI.getOverview(), masterAPI.getSettings()]) : [];
      setOverview(ovRes.data.data);
      setSettings(setRes.data.data);
    } catch (err) {
      console.error('Failed to load master admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [ovRes, setRes] = await Promise.all([
          masterAPI.getOverview(),
          masterAPI.getSettings(),
        ]);
        setOverview(ovRes.data.data);
        setSettings(setRes.data.data);
      } catch (err) {
        console.error('Failed to load master admin overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleMaintenance = async () => {
    if (!settings) return;
    const nextState = !settings.maintenanceMode;

    setModalConfig({
      title: `${nextState ? 'Activate' : 'Deactivate'} Global Maintenance Mode`,
      message: nextState
        ? 'WARNING: Turning ON Maintenance Mode will block all non-admin users from creating reservations or logging in. Master Admin console remains online.'
        : 'Maintenance mode will be lifted and regular commuters can access the platform normally.',
      action: async () => {
        setSavingSettings(true);
        try {
          const updated = { ...settings, maintenanceMode: nextState };
          const res = await masterAPI.updateSettings(updated);
          setSettings(res.data.data);
          setModalOpen(false);
        } catch (err) {
          alert('Failed to update maintenance state');
        } finally {
          setSavingSettings(false);
        }
      },
    });
    setModalOpen(true);
  };

  const handleUpdateFeatureFlag = async (flagKey) => {
    if (!settings) return;
    const currentFlags = settings.featureFlags || {};
    const updatedFlags = { ...currentFlags, [flagKey]: !currentFlags[flagKey] };
    const updated = { ...settings, featureFlags: updatedFlags };

    setSavingSettings(true);
    try {
      const res = await masterAPI.updateSettings(updated);
      setSettings(res.data.data);
    } catch (err) {
      alert('Failed to update feature flag');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExecuteOverride = (e) => {
    e.preventDefault();
    setOverrideError('');
    setOverrideSuccess('');

    if (!overrideBookingId.trim()) {
      setOverrideError('Please enter a valid Booking ID');
      return;
    }

    setModalConfig({
      title: `Confirm Booking Override: ${overrideAction}`,
      message: `Are you sure you want to execute "${overrideAction}" on booking ${overrideBookingId}? An immutable audit log entry will be permanently written.`,
      action: async () => {
        setOverrideLoading(true);
        try {
          const res = await masterAPI.overrideBooking(overrideBookingId.trim(), overrideAction, overrideNote);
          setOverrideSuccess(`Override executed: ${res.data.message}`);
          setOverrideBookingId('');
          setOverrideNote('');
          setModalOpen(false);
        } catch (err) {
          setOverrideError(err.response?.data?.error || 'Override execution failed');
          setModalOpen(false);
        } finally {
          setOverrideLoading(false);
        }
      },
    });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-purple-300">Authorizing Master Super-Admin telemetry...</p>
      </div>
    );
  }

  const m = overview?.metrics || {
    totalRevenue: 0,
    totalUsers: 0,
    totalOwners: 0,
    totalAdmins: 0,
    totalParkings: 0,
    totalSlots: 0,
    totalBookings: 0,
    auditLogCount: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Super Admin Top Header (Purple Aesthetic) */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-600/50 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-purple-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/60 text-xs font-bold text-purple-200">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Master Super-Admin Authorization Zone</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Platform Sovereign Console
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl">
            Highest clearance tier. Full authority over database state, role hierarchy, manual payment overrides, and live system kill-switches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/master/audit-logs"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-purple-200 border border-purple-700/80 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Audit Log Explorer ({m.auditLogCount})</span>
          </Link>

          <button
            onClick={handleToggleMaintenance}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all ${
              settings?.maintenanceMode
                ? 'bg-rose-600 text-white shadow-rose-600/40 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{settings?.maintenanceMode ? 'MAINTENANCE ACTIVE' : 'System Online'}</span>
          </button>
        </div>
      </div>

      {/* Global Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Platform Total Volume"
          value={`$${m.totalRevenue.toFixed(2)}`}
          subtext="Net payment settlements"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total User Accounts"
          value={m.totalUsers}
          subtext={`${m.totalOwners} facility owners, ${m.totalAdmins} admins`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Connected Garages"
          value={m.totalParkings}
          subtext={`${m.totalSlots} monitored bays`}
          icon={Building2}
          color="brand"
        />
        <StatCard
          title="Audit Log Records"
          value={m.auditLogCount}
          subtext="Tamper-evident system actions"
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      {/* City Heatmap & Top Garages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* City Demand Heatmap */}
        <div className="lg:col-span-2 bg-slate-900 border border-purple-900/40 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              City-Wise Demand Heatmap & Fleet Saturation
            </h3>
            <span className="text-xs text-purple-300 font-mono">Geographic Aggregation</span>
          </div>

          {!overview?.cityDemand || overview.cityDemand.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No city telemetry available.</div>
          ) : (
            <div className="space-y-4">
              {overview.cityDemand.map((cityData) => {
                const percentage = Math.min(100, Math.round((cityData.bookingsCount / Math.max(1, m.totalBookings)) * 100));

                return (
                  <div key={cityData.city} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-sm">{cityData.city}</span>
                      <div className="flex items-center gap-4 text-slate-400">
                        <span>{cityData.parkingsCount} facilities</span>
                        <span className="font-semibold text-emerald-400">${cityData.totalRevenue.toFixed(2)}</span>
                        <span className="font-bold text-sky-400 font-mono">{cityData.bookingsCount} bookings</span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(8, percentage)}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 to-sky-400 rounded-full"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top-performing garages */}
        <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Top Performing Garages
            </h3>
          </div>

          <div className="space-y-3">
            {overview?.topParkings?.map((tp, idx) => (
              <div key={tp.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">
                    #{idx + 1} {tp.name}
                  </div>
                  <div className="text-[11px] text-slate-400">{tp.city}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-sm">{tp._count?.bookings || 0}</span>
                  <span className="text-[10px] text-slate-400 block">passes issued</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Booking Override Console & System Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manual Booking Override Console */}
        <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Manual Booking & Payment Override
            </h3>
            <p className="text-xs text-slate-400">
              Force-cancel, force-confirm, or force-refund any booking. Every action logs an immutable audit trail.
            </p>
          </div>

          {overrideSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{overrideSuccess}</span>
            </div>
          )}

          {overrideError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{overrideError}</span>
            </div>
          )}

          <form onSubmit={handleExecuteOverride} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Target Booking ID</label>
              <input
                type="text"
                required
                value={overrideBookingId}
                onChange={(e) => setOverrideBookingId(e.target.value)}
                placeholder="e.g. clx123abc456..."
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Override Action</label>
              <select
                value={overrideAction}
                onChange={(e) => setOverrideAction(e.target.value)}
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="FORCE_REFUND">FORCE_REFUND (Cancel reservation & mark refunded)</option>
                <option value="FORCE_CANCEL">FORCE_CANCEL (Cancel reservation & free up slot)</option>
                <option value="FORCE_CONFIRM">FORCE_CONFIRM (Manually mark confirmed & paid)</option>
                <option value="FORCE_COMPLETE">FORCE_COMPLETE (Mark booking completed)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Audit Justification Note</label>
              <input
                type="text"
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="Reason: Driver refund request approved / terminal sensor reset..."
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={overrideLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all"
            >
              {overrideLoading ? 'Executing & Logging Override...' : 'Execute Override Action'}
            </button>
          </form>
        </div>

        {/* Global Feature Flags & Governance Settings */}
        <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              Dynamic Feature Flags & Platform Parameters
            </h3>
            <p className="text-xs text-slate-400">
              Control global parameters stored in Postgres system configuration.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { key: 'evChargingDiscount', label: 'EV Charging Incentive Subsidy', desc: 'Auto-applies renewable transit rate reduction to EV bays' },
              { key: 'instantQrScanning', label: 'Instant Fast-Track QR Validation', desc: 'Allows automated optical gate clearance at terminals' },
              { key: 'surgePricing', label: 'Automated Demand Surge Multiplier', desc: 'Dynamically scale rates during peak hours' },
            ].map((f) => {
              const isActive = !!settings?.featureFlags?.[f.key];

              return (
                <div
                  key={f.key}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-white block">{f.label}</span>
                    <span className="text-[11px] text-slate-400">{f.desc}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateFeatureFlag(f.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      isActive ? 'bg-purple-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="Execute Master Action"
        isDanger={true}
        onConfirm={modalConfig.action}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
