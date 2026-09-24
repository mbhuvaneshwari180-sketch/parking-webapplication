import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'brand',
}) {
  const colorMap = {
    brand: 'text-brand-400 bg-brand-950/60 border-brand-800/60',
    emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    purple: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    amber: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    rose: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[color] || colorMap.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
            {trend}
          </span>
        )}
      </div>

      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
