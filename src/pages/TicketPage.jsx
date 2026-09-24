import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { 
  Printer, 
  ChevronLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Car, 
  Download,
  ParkingCircle
} from 'lucide-react';

export default function TicketPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await bookingAPI.getById(bookingId);
        setBooking(res.data.data);
      } catch (err) {
        setError('Failed to load pass credentials');
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Decrypting ticket credentials...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-rose-800 rounded-2xl text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <Link to="/my-bookings" className="inline-block px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">
          View My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      {/* Top back bar & Print */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> My Bookings
        </Link>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Pass</span>
        </button>
      </div>

      {/* Modern Smart Boarding Pass Style Card */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 print:border-black print:text-black">
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-brand-700 to-sky-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <span className="font-black text-lg tracking-tight block">ParkingSpot Pass</span>
              <span className="text-[10px] text-sky-100 font-medium uppercase tracking-wider">Fast-Track Entry</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold font-mono">
            {booking.slot?.type}
          </span>
        </div>

        {/* Middle Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">Facility</span>
            <div className="text-lg font-bold text-white leading-tight">{booking.parking?.name}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              {booking.parking?.address}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Assigned Bay</span>
              <span className="text-2xl font-black text-brand-400 font-mono">{booking.slot?.code}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Ticket Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-sm mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live"></span>
                {booking.status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Valid From</span>
              <span className="font-semibold text-slate-200">
                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {new Date(booking.startTime).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Valid Until</span>
              <span className="font-semibold text-slate-200">
                {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {new Date(booking.endTime).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Scannable QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <img src={booking.qrCode} alt="Terminal Access QR" className="w-48 h-48 rounded" />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                CRYPTOGRAPHIC TOKEN
              </span>
              <span className="font-mono font-bold text-sky-400 text-xs tracking-wider">
                {booking.qrToken}
              </span>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 leading-relaxed">
            Scan this QR code or type token at the automated terminal barrier. Entry opens 10 minutes prior to scheduled start.
          </div>
        </div>
      </div>
    </div>
  );
}
