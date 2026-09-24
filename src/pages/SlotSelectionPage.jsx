import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { parkingAPI } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import SlotGrid from '../components/SlotGrid';
import { 
  ChevronLeft, 
  Radio, 
  ArrowRight, 
  Car, 
  Bike, 
  Zap, 
  Filter, 
  RefreshCw,
  Clock
} from 'lucide-react';

export default function SlotSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  // Fetcher for polling hook
  const fetchSlots = useCallback(async () => {
    const res = await parkingAPI.getSlots(id);
    return res.data?.data;
  }, [id]);

  // Poll every 3500ms (3.5 seconds)
  const { data, loading, isPulsing, lastUpdated, refresh } = usePolling(fetchSlots, 3500, true);

  const slots = data?.slots || [];
  const counts = data?.counts || { total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 };

  const handleProceed = () => {
    if (!selectedSlot) return;
    navigate(`/book/${selectedSlot.id}`, { state: { slot: selectedSlot, parkingId: id } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-28">
      {/* Top Breadcrumb & Live Polling Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/parkings/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Parking Overview
        </Link>

        {/* Live sync pill */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className={`w-2.5 h-2.5 rounded-full bg-emerald-500 ${isPulsing ? 'scale-125' : 'radar-live'} transition-transform`}></span>
            <span>Live Sync Active (3.5s)</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono text-[11px]">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Connecting...'}
          </span>
          <button
            onClick={() => refresh()}
            title="Manual sync"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPulsing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Header & Bay Counters */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Select Your Parking Bay</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Click any open bay to reserve immediately. Stalls are locked with double-booking prevention.
          </p>
        </div>

        {/* Live summary counters */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="text-center px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300">
            <span className="block text-lg font-black">{counts.available}</span>
            <span>Available</span>
          </div>
          <div className="text-center px-3 py-1.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300">
            <span className="block text-lg font-black">{counts.occupied}</span>
            <span>Occupied</span>
          </div>
          <div className="text-center px-3 py-1.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300">
            <span className="block text-lg font-black">{counts.reserved}</span>
            <span>Reserved</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Bays:
        </span>
        {[
          { label: 'All Stalls', val: 'ALL' },
          { label: 'Cars', val: 'CAR', icon: Car },
          { label: 'Motorcycles', val: 'BIKE', icon: Bike },
          { label: 'EV Charging', val: 'EV', icon: Zap },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.val}
              type="button"
              onClick={() => setFilterType(t.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                filterType === t.val
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Slot Grid */}
      {loading && slots.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Querying slot sensor telemetry...</p>
        </div>
      ) : (
        <SlotGrid
          slots={slots}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          filterType={filterType}
        />
      )}

      {/* Floating Bottom Selection Bar */}
      {selectedSlot && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-brand-500/50 p-4 rounded-2xl shadow-2xl shadow-brand-500/20 flex items-center justify-between gap-4 z-40 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md">
              {selectedSlot.code}
            </div>
            <div>
              <div className="text-xs text-slate-400">Selected Bay ({selectedSlot.type})</div>
              <div className="text-base font-extrabold text-white">
                ${selectedSlot.pricePerHour.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ hour</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <span>Proceed to Reserve</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
