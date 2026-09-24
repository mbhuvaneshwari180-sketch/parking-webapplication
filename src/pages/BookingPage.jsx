import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { bookingAPI, parkingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Car, 
  ShieldCheck, 
  CreditCard, 
  AlertCircle, 
  Zap,
  ArrowRight
} from 'lucide-react';

export default function BookingPage() {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, demoLogin } = useAuth();

  const [slot, setSlot] = useState(location.state?.slot || null);
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(!slot);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default start: now + 5 min, end: now + 2 hours
  const formatDatetimeForInput = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const initialStart = new Date(Date.now() + 5 * 60 * 1000);
  const initialEnd = new Date(Date.now() + 2 * 60 * 60 * 1000);

  const [startTime, setStartTime] = useState(formatDatetimeForInput(initialStart));
  const [endTime, setEndTime] = useState(formatDatetimeForInput(initialEnd));

  useEffect(() => {
    async function initPage() {
      // Ensure commuter credentials exist so unauthenticated users never get blocked
      if (!isAuthenticated && !localStorage.getItem('parkingspot_token')) {
        try {
          await demoLogin('COMMUTER');
        } catch (e) {
          console.warn('Auto-session initialization skipped:', e);
        }
      }

      try {
        const parkingId = location.state?.parkingId;
        if (parkingId) {
          const res = await parkingAPI.getById(parkingId);
          setParking(res.data.data);
          if (!slot) {
            const foundSlot = res.data.data.slots.find((s) => s.id === slotId);
            setSlot(foundSlot);
          }
        } else if (slotId) {
          const res = await parkingAPI.getAll();
          const list = res.data?.data || [];
          for (const p of list) {
            const detail = await parkingAPI.getById(p.id);
            const foundSlot = detail.data?.data?.slots?.find((s) => s.id === slotId);
            if (foundSlot) {
              setParking(detail.data.data);
              setSlot(foundSlot);
              break;
            }
          }
        }
      } catch (err) {
        setError('Failed to load slot details');
      } finally {
        setLoading(false);
      }
    }

    initPage();
  }, [slotId]);

  // Duration and Price calculation
  const startD = new Date(startTime);
  const endD = new Date(endTime);
  const diffHours = Math.max(1, (endD.getTime() - startD.getTime()) / (1000 * 60 * 60));
  const hourlyRate = slot?.pricePerHour || 40.0;
  const totalAmount = parseFloat((diffHours * hourlyRate).toFixed(2));

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (endD <= startD) {
      setError('Departure time must be strictly after arrival time');
      return;
    }

    setSubmitting(true);
    try {
      if (!localStorage.getItem('parkingspot_token')) {
        try {
          await demoLogin('COMMUTER');
        } catch (err) {}
      }

      const res = await bookingAPI.create({
        parkingId: slot?.parkingId || parking?.id,
        slotId: slot?.id || slotId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      const booking = res.data?.data?.booking;
      const qrCode = res.data?.data?.qrCode;
      const invoiceNumber = res.data?.data?.invoiceNumber;

      // Navigate straight to the Invoice & Pass page (skipping payment gateway)
      navigate(`/checkout/${booking.id}`, {
        state: { booking, qrCode, invoiceNumber },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Reservation failed. Slot may have just been claimed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Configuring bay parameters...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to={parking ? `/parkings/${parking.id}/slots` : '/parkings'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Change Bay
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Reservation Setup Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">Reserve Parking Bay</h1>
              <p className="text-xs text-slate-400">
                Choose your schedule. Your bay will be reserved exclusively for your vehicle.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-400" />
                    Arrival Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Departure Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              {/* Security notice */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Instant Bay Reservation & Invoice Guarantee</span>
                  When you confirm, this stall is immediately locked in the central database and your official Tamil Nadu smart parking tax invoice with access pass is generated.
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm Reservation & Generate Invoice</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
            <h3 className="font-extrabold text-white text-base border-b border-slate-800 pb-3">
              Booking Summary
            </h3>

            {/* Bay Specs */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Bay Code</span>
                <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {slot?.code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vehicle Type</span>
                <span className="font-semibold text-sky-400">{slot?.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hourly Rate</span>
                <span className="font-semibold text-slate-200">₹{(slot?.pricePerHour || hourlyRate).toFixed(2)}/hr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Duration</span>
                <span className="font-semibold text-slate-200">{diffHours.toFixed(1)} hrs</span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Subtotal</span>
                <span>₹{(diffHours * hourlyRate).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Urban Grid Service Fee</span>
                <span className="text-emerald-400">₹0.00 (Waived)</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800/80">
                <span>Total Due</span>
                <span className="text-brand-400">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
