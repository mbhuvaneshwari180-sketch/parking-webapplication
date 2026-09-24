import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Car, 
  Calendar,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DAILY'); // 'DAILY' | 'PEAK_HOURS'

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await analyticsAPI.getOwnerAnalytics();
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const summary = data?.summary || {
    totalRevenue: 0,
    occupancyRate: 0,
    totalBookingsCount: 0,
    totalSlots: 0,
  };

  const dailyRevenue = data?.charts?.dailyRevenue || [];
  const peakHours = data?.charts?.peakHours || [];

  const maxDailyRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 100);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Synthesizing revenue & peak utilization telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Facility Analytics & Yield</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Occupancy distribution, peak traffic hours, and revenue trends across your parking assets.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Platform Revenue"
          value={`₹${summary.totalRevenue.toFixed(2)}`}
          subtext="Processed payments from reservations"
          icon={DollarSign}
          trend="+18.4%"
          color="emerald"
        />
        <StatCard
          title="Fleet Occupancy"
          value={`${summary.occupancyRate}%`}
          subtext="Aggregate capacity utilization"
          icon={Car}
          color="brand"
        />
        <StatCard
          title="Customer Volume"
          value={summary.totalBookingsCount}
          subtext="Total drivers served"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Main Analytics Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Performance Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Interactive visualization of commercial yield and hourly traffic density.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('DAILY')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'DAILY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Revenue (₹)
            </button>
            <button
              onClick={() => setActiveTab('PEAK_HOURS')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'PEAK_HOURS'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Peak-Hour Density (%)
            </button>
          </div>
        </div>

        {/* Chart 1: Daily Revenue */}
        {activeTab === 'DAILY' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Past 7 Days Financial Intake</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> Strong weekend peak
              </span>
            </div>

            <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-2 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              {dailyRevenue.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.revenue / maxDailyRevenue) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{item.revenue}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-emerald-700 to-emerald-400 group-hover:from-emerald-600 group-hover:to-emerald-300 transition-all shadow-lg shadow-emerald-950/50"
                    ></div>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">
                      {item.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart 2: Peak Hours Curve */}
        {activeTab === 'PEAK_HOURS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>24-Hour Utilization Curve (00:00 - 23:00)</span>
              <span className="text-brand-400 font-semibold">Morning & Evening Commute Surges</span>
            </div>

            <div className="h-64 flex items-end justify-between gap-1 pt-8 pb-2 px-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-x-auto">
              {peakHours.map((item, idx) => {
                const heightPercent = Math.max(8, item.utilization);
                const isHighSurge = item.utilization >= 75;

                return (
                  <div key={idx} className="flex-1 min-w-[20px] flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-bold text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.utilization}%
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        isHighSurge
                          ? 'bg-gradient-to-t from-rose-600 to-amber-400'
                          : 'bg-gradient-to-t from-brand-700 to-sky-400'
                      }`}
                    ></div>
                    {idx % 3 === 0 && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        {item.hour.split(':')[0]}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
