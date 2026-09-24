import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  Zap, 
  Wallet
} from 'lucide-react';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('MOCK');

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await bookingAPI.getById(bookingId);
        setBooking(res.data.data);
      } catch (err) {
        setError('Failed to load booking payment invoice');
      } finally {
        setLoading(false);
      }
    }

    if (!booking) {
      loadBooking();
    }
  }, [bookingId]);

  const handlePay = async () => {
    setError('');
    setPaying(true);

    try {
      // Execute payment via backend abstraction
      const res = await bookingAPI.pay(bookingId, {
        provider,
        paymentId: `pay_${Date.now()}`,
      });

      const confirmedBooking = res.data?.data?.booking;
      const qrCode = res.data?.data?.qrCode;

      // Navigate to Confirmation Page
      navigate(`/confirmation/${bookingId}`, {
        state: { booking: confirmedBooking, qrCode },
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Payment execution failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading secure checkout portal...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-rose-800 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Payment Error</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <Link to="/parkings" className="inline-block px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">
          Return to Garages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/parkings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Cancel & Exit Checkout
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        <div className="flex items-start justify-between border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              Secure Checkout
            </span>
            <h1 className="text-2xl font-black text-white">Complete Reservation</h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-3xl font-black text-brand-400">${booking?.amount.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Invoice Summary */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Terminal</span>
            <span className="font-semibold text-white">{booking?.parking?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reserved Bay Code</span>
            <span className="font-mono font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {booking?.slot?.code} ({booking?.slot?.type})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Start Time</span>
            <span className="text-slate-200">{new Date(booking?.startTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">End Time</span>
            <span className="text-slate-200">{new Date(booking?.endTime).toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Gateway Options */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Select Payment Method
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setProvider('MOCK')}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                provider === 'MOCK'
                  ? 'bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Mock Instant Gateway</span>
                <span className="text-[11px] text-slate-400">1-Click sandbox test payment</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setProvider('RAZORPAY')}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                provider === 'RAZORPAY'
                  ? 'bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Razorpay / Stripe</span>
                <span className="text-[11px] text-slate-400">Cards, UPI & Wallets</span>
              </div>
            </button>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>256-bit TLS encrypted session. Backend verifies HMAC signatures without exposing keys.</span>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
        >
          {paying ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Securing Transaction & Locking Bay...</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm & Pay ${booking?.amount.toFixed(2)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
