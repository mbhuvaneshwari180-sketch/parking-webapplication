import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { parkingAPI } from '../services/api';
import { 
  Search, 
  MapPin, 
  Filter, 
  Car, 
  Bike, 
  Zap, 
  ArrowUpDown, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ParkingSquare
} from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [sortBy, setSortBy] = useState('availability'); // 'availability' | 'price_asc' | 'price_desc'

  const fetchParkings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (query) params.query = query;
      if (city) params.city = city;
      if (type) params.type = type;

      const res = await parkingAPI.getAll(params);
      let list = res.data?.data || [];

      // Client-side sort
      if (sortBy === 'availability') {
        list.sort((a, b) => b.availableSlots - a.availableSlots);
      } else if (sortBy === 'price_asc') {
        list.sort((a, b) => a.minPrice - b.minPrice);
      } else if (sortBy === 'price_desc') {
        list.sort((a, b) => b.minPrice - a.minPrice);
      }

      setParkings(list);
    } catch (err) {
      setError('Failed to fetch parking locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, [city, type, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParkings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Available Parking Garages</h1>
          <p className="text-sm text-slate-400">Locate live bays with real-time occupancy and dynamic hourly rates</p>
        </div>

        {/* Filter Controls Row */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, area or parking name"
                className="w-full bg-slate-950 text-white pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Filter by city..."
                className="w-36 bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-brand-500"
              />

              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Vehicle Type Tabs & Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="font-semibold text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Vehicle:
              </span>
              {[
                { label: 'All Types', val: '' },
                { label: 'Cars', val: 'CAR', icon: Car },
                { label: 'Bikes', val: 'BIKE', icon: Bike },
                { label: 'EV Bays', val: 'EV', icon: Zap },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setType(t.val)}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                      type === t.val
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="availability">Most Available Slots</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Scanning parking network telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center text-rose-300 text-sm">
          {error}
        </div>
      ) : parkings.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <ParkingSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No parking facilities found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing the vehicle filter, or searching for a different city.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setCity('');
              setType('');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkings.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
            >
              {/* Image banner */}
              <div className="relative h-48 bg-slate-950 overflow-hidden">
                <img
                  src={
                    p.imageUrl ||
                    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                {/* City badge */}
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-400" />
                  {p.city}
                </div>

                {/* Live slots counter */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950/90 backdrop-blur border border-emerald-600/60 text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live"></span>
                    {p.availableSlots} Available
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-800 text-slate-300 text-xs">
                    {p.totalSlots} Total
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-lg text-white group-hover:text-sky-300 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.address}</p>
                </div>

                {/* Vehicle types supported */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-400">Supports:</span>
                  {p.supportedTypes?.map((st) => (
                    <span
                      key={st}
                      className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]"
                    >
                      {st}
                    </span>
                  ))}
                </div>

                {/* Price & CTA Button */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Starting from</span>
                    <span className="text-lg font-black text-white">₹{p.minPrice.toFixed(2)}</span>
                    <span className="text-xs text-slate-400">/hr</span>
                  </div>

                  <Link
                    to={`/parkings/${p.id}`}
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
