import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { 
  CheckCircle2, 
  Ticket, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck,
  Download
} from 'lucide-react';

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [qrCode, setQrCode] = useState(location.state?.qrCode || null);
  const [loading, setLoading] = useState(!booking);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadConfirmedBooking() {
      try {
        const res = await bookingAPI.getById(bookingId);
        setBooking(res.data.data);
        if (res.data.data.qrCode) {
          setQrCode(res.data.data.qrCode);
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!booking) {
      loadConfirmedBooking();
    }
  }, [bookingId]);

  const copyToken = () => {
    if (booking?.qrToken) {
      navigator.clipboard.writeText(booking.qrToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Finalizing ticket cryptography...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Success Hero */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-950 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
        <p className="text-xs text-slate-400">
          Your bay has been locked in the central urban grid and is ready for entry.
        </p>
      </div>

      {/* Confirmation Pass Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Booking Reference</span>
              <div className="font-mono font-bold text-sm text-sky-400">{booking?.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-xs font-bold">
                {booking?.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700 text-brand-300 text-xs font-bold">
                {booking?.paymentStatus}
              </span>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Terminal</span>
              <span className="font-bold text-white text-sm">{booking?.parking?.name}</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">{booking?.parking?.address}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Assigned Bay</span>
              <span className="font-mono font-extrabold text-white text-lg bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 inline-block">
                {booking?.slot?.code} ({booking?.slot?.type})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Arrival Window</span>
              <span className="font-semibold text-slate-200">
                {new Date(booking?.startTime).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Departure Window</span>
              <span className="font-semibold text-slate-200">
                {new Date(booking?.endTime).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Amount Paid</span>
              <span className="font-bold text-emerald-400 text-sm">${booking?.amount.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code Presentation */}
          {qrCode && (
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 flex flex-col items-center justify-center space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <img src={qrCode} alt="Access QR Code" className="w-48 h-48 rounded-lg" />
              </div>
              <div className="text-center space-y-1">
                <span className="text-[11px] text-slate-400 block">Cryptographic Entry Token:</span>
                <div className="inline-flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="font-mono font-bold text-sky-400 text-xs">{booking?.qrToken}</span>
                  <button onClick={copyToken} className="text-slate-400 hover:text-white">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Link
            to="/my-bookings"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← View All My Bookings
          </Link>

          <Link
            to={`/ticket/${booking?.id}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Ticket className="w-4 h-4" />
            <span>Digital Ticket & Pass</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
