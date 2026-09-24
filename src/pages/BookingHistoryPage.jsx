import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Receipt
} from 'lucide-react';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getMine();
      setBookings(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      await bookingAPI.cancel(selectedBooking.id);
      setCancelModalOpen(false);
      setSelectedBooking(null);
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return b.status === 'CONFIRMED' || b.status === 'PENDING';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Reservations</h1>
          <p className="text-xs sm:text-sm text-slate-400">View upcoming, active, and past parking passes</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filter === f
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Retrieving passes...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center text-rose-300 text-sm">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No bookings in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ready to park? Search city parking terminals and reserve your stall instantly.
          </p>
          <Link
            to="/parkings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            <span>Find a Parking Spot</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const isCancellable = b.status === 'CONFIRMED' || b.status === 'PENDING';

            return (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
              >
                {/* Left Meta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : b.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : b.status === 'COMPLETED'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Payment: {b.paymentStatus}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      REF: {b.id.slice(0, 10)}...
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base">{b.parking?.name}</h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      {b.parking?.city}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-bold text-sky-400">
                      Bay {b.slot?.code} ({b.slot?.type})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Total</span>
                    <span className="text-xl font-black text-white">₹{b.amount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Tax Invoice */}
                    <Link
                      to={`/checkout/${b.id}`}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Receipt className="w-3.5 h-3.5 text-brand-400" />
                      <span>Invoice</span>
                    </Link>

                    {/* View Digital Pass */}
                    <Link
                      to={`/ticket/${b.id}`}
                      className="px-3.5 py-2 bg-brand-600/80 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Pass / QR</span>
                    </Link>

                    {/* Cancel Action */}
                    {isCancellable && (
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setCancelModalOpen(true);
                        }}
                        className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Booking Cancellation */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Parking Pass"
        message={`Are you sure you want to cancel your reservation for ${selectedBooking?.parking?.name} (Bay ${selectedBooking?.slot?.code})? The slot will immediately be made available for other commuters.`}
        confirmText="Confirm Cancellation"
        isDanger={true}
        isLoading={cancelling}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
