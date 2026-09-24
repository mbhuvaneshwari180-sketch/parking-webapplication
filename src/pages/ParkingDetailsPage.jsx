import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parkingAPI } from '../services/api';
import RadarMap from '../components/RadarMap';
import { 
  MapPin, 
  Shield, 
  Zap, 
  Clock, 
  Car, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  ChevronLeft,
  Navigation
} from 'lucide-react';

export default function ParkingDetailsPage() {
  const { id } = useParams();
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadParking() {
      try {
        const res = await parkingAPI.getById(id);
        setParking(res.data.data);
      } catch (err) {
        setError('Failed to retrieve parking location details');
      } finally {
        setLoading(false);
      }
    }
    loadParking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading facility details...</p>
      </div>
    );
  }

  if (error || !parking) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-slate-900 border border-rose-800 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Facility Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'This parking terminal does not exist or has been removed.'}</p>
        <Link to="/parkings" className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
          Return to Search
        </Link>
      </div>
    );
  }

  const minPrice = parking.slots?.length
    ? Math.min(...parking.slots.map((s) => s.pricePerHour))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link to="/parkings" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Parking Locations
        </Link>
      </div>

      {/* Hero Visual Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 h-72 sm:h-96 bg-slate-950 shadow-2xl">
        <img
          src={parking.imageUrl || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=80'}
          alt={parking.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur border border-slate-700 text-xs text-sky-400 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              {parking.city} Metropolitan District
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{parking.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-brand-400" />
              {parking.address}
            </p>
          </div>

          <Link
            to={`/parkings/${parking.id}/slots`}
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Select a Slot
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Details + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Amenities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block font-medium">Available Bays</span>
              <span className="text-2xl font-black text-emerald-400 flex items-center justify-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live"></span>
                {parking.availableSlots}
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block font-medium">Occupied / Reserved</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">
                {parking.occupiedSlots}
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block font-medium">Rates From</span>
              <span className="text-2xl font-black text-white mt-1 block">
                ${minPrice.toFixed(2)}<span className="text-xs text-slate-400 font-normal">/hr</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
            <h3 className="text-lg font-bold text-white">Facility Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {parking.description ||
                'Modern urban parking infrastructure equipped with high-speed automated barrier scanning, license plate recognition, and round-the-clock security monitoring.'}
            </p>
          </div>

          {/* Amenities & Security Standards */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Smart Hub Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                <Shield className="w-4 h-4 text-brand-400" />
                <span>24/7 CCTV & Security Guard</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>EV Fast Chargers Available</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Guaranteed Bay Access</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                <Car className="w-4 h-4 text-sky-400" />
                <span>Automated Barrier Clearance</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Digital QR Pass Entry</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Covered Climate Stalls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Geo Radar Map */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Precise Geo Location</h3>
            <RadarMap
              latitude={parking.latitude}
              longitude={parking.longitude}
              name={parking.name}
              address={parking.address}
              height="280px"
            />
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Facility Operator:</span>
                <span className="font-semibold text-slate-200">{parking.owner?.name || 'Verified Partner'}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Stalls:</span>
                <span className="font-semibold text-slate-200">{parking.slots?.length || 0} bays</span>
              </div>
            </div>

            <Link
              to={`/parkings/${parking.id}/slots`}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-center block text-sm transition-all shadow-lg shadow-brand-600/30"
            >
              Choose Slot & Reserve Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
