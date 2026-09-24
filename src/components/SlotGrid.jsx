import React from 'react';
import { Car, Bike, Zap, CheckCircle2, AlertTriangle, Lock, Clock } from 'lucide-react';

export default function SlotGrid({ slots = [], selectedSlot = null, onSelectSlot, filterType = 'ALL' }) {
  const filteredSlots = slots.filter((slot) => {
    if (filterType === 'ALL') return true;
    return slot.type === filterType;
  });

  const getStatusColor = (status, isSelected) => {
    if (isSelected) {
      return 'bg-brand-500 text-white border-brand-300 ring-4 ring-brand-500/30 scale-105';
    }

    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40 hover:border-emerald-400 hover:bg-emerald-900/50 cursor-pointer shadow-sm';
      case 'OCCUPIED':
        return 'bg-rose-950/40 text-rose-300 border-rose-800/40 cursor-not-allowed opacity-75';
      case 'RESERVED':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/40 cursor-not-allowed opacity-80';
      case 'MAINTENANCE':
        return 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Available</span>;
      case 'OCCUPIED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400"><Lock className="w-3 h-3" /> Occupied</span>;
      case 'RESERVED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400"><Clock className="w-3 h-3" /> Reserved</span>;
      case 'MAINTENANCE':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400"><AlertTriangle className="w-3 h-3" /> Offline</span>;
      default:
        return null;
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'CAR':
        return <Car className="w-5 h-5 text-sky-400" />;
      case 'BIKE':
        return <Bike className="w-5 h-5 text-emerald-400" />;
      case 'EV':
        return <Zap className="w-5 h-5 text-amber-400" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500"></span> Available
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-500"></span> Occupied
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500"></span> Reserved
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-600"></span> Maintenance
        </div>
      </div>

      {filteredSlots.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
          No parking bays match the selected vehicle filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredSlots.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id;
            const isClickable = slot.status === 'AVAILABLE';

            return (
              <button
                key={slot.id}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectSlot && onSelectSlot(slot)}
                className={`p-4 rounded-xl border-2 flex flex-col justify-between text-left transition-all relative ${getStatusColor(
                  slot.status,
                  isSelected
                )}`}
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div className="flex items-center gap-2">
                    {getVehicleIcon(slot.type)}
                    <span className="font-extrabold text-base tracking-wide text-white">{slot.code}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                    {slot.type}
                  </span>
                </div>

                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Rate:</span>
                    <span className="font-bold text-white">${slot.pricePerHour.toFixed(2)}/hr</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800/60">
                    {getStatusBadge(slot.status)}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-brand-400 text-slate-950 rounded-full p-0.5 shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
