import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Car, 
  Bike, 
  Zap, 
  Download, 
  ChevronLeft, 
  Ticket, 
  Receipt,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [qrCode, setQrCode] = useState(location.state?.qrCode || null);
  const [invoiceNumber, setInvoiceNumber] = useState(
    location.state?.invoiceNumber || `INV-TN-CHN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInvoice() {
      try {
        const res = await bookingAPI.getById(bookingId);
        const data = res.data?.data;
        setBooking(data);
        if (data?.qrCode) setQrCode(data.qrCode);
        if (data?.invoiceNumber) setInvoiceNumber(data.invoiceNumber);
      } catch (err) {
        setError('Failed to load official parking invoice');
      } finally {
        setLoading(false);
      }
    }

    if (!booking) {
      loadInvoice();
    }
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Generating Tamil Nadu Smart Parking Tax Invoice...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-rose-800 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-950 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Invoice Retrieval Notice</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <Link to="/parkings" className="inline-block px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold">
          Return to Chennai Parking Hubs
        </Link>
      </div>
    );
  }

  const startD = new Date(booking?.startTime);
  const endD = new Date(booking?.endTime);
  const durationHours = Math.max(1, (endD.getTime() - startD.getTime()) / (1000 * 60 * 60));
  const hourlyRate = booking?.slot?.pricePerHour || 40.0;
  const baseSubtotal = (durationHours * hourlyRate);
  const cgst = baseSubtotal * 0.09;
  const sgst = baseSubtotal * 0.09;
  const grandTotal = baseSubtotal + cgst + sgst;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Controls / Breadcrumbs (Hidden on Print) */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/parkings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Garages
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-brand-400" />
            <span>Print Invoice (PDF)</span>
          </button>

          <Link
            to={`/ticket/${booking?.id}`}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-600/30 transition-all"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Digital Gate Pass</span>
          </Link>
        </div>
      </div>

      {/* Official Tax Invoice Container */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl print:border-black print:text-black print:bg-white">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 border-b border-slate-800 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reservation Confirmed • முன்பதிவு உறுதி செய்யப்பட்டது</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-6 h-6 text-brand-400" />
              Parking Reservation Tax Invoice
            </h1>
            <p className="text-xs text-slate-400">
              Greater Chennai Corporation (GCC) & Tamil Nadu Smart Mobility Grid
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Invoice Reference</span>
            <span className="text-sm font-mono font-black text-brand-400 block">{invoiceNumber}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Invoice Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Customer & Facility Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Billed To (Commuter)</span>
              <div className="font-extrabold text-white text-sm">
                {booking?.user?.name || 'K. Anbarasan (Commuter)'}
              </div>
              <div className="text-slate-400">{booking?.user?.email || 'commuter@demo.com'}</div>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                Vehicle: {booking?.slot?.type || 'CAR'}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Parking Terminal (Facility)</span>
              <div className="font-extrabold text-white text-sm">
                {booking?.parking?.name || 'T. Nagar Pondy Bazaar Smart MLCP'}
              </div>
              <div className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>{booking?.parking?.address || 'Panagal Park, Sir Thyagaraya Road, T. Nagar, Chennai - 600017'}</span>
              </div>
              <div className="text-slate-400">
                City / Region: <span className="text-slate-200 font-semibold">{booking?.parking?.city || 'Chennai'}, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* Bay and Slot Schedule Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Assigned Bay</span>
              <span className="font-mono font-black text-white text-lg bg-slate-900 px-3 py-0.5 rounded-lg border border-slate-700">
                {booking?.slot?.code || 'TN-01'}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Arrival Window</span>
              <span className="font-semibold text-slate-200 block">
                {new Date(booking?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(booking?.startTime).toLocaleDateString()}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Departure Window</span>
              <span className="font-semibold text-slate-200 block">
                {new Date(booking?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(booking?.endTime).toLocaleDateString()}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Total Duration</span>
              <span className="font-black text-brand-400 text-lg block">
                {durationHours.toFixed(1)} hrs
              </span>
            </div>
          </div>

          {/* Itemized Tax Breakdown Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Description / Tariff Line</th>
                  <th className="py-3 px-4 text-center">Rate</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white block">Dedicated Stall Parking Tariff</span>
                    <span className="text-[11px] text-slate-400">Bay code {booking?.slot?.code || 'TN-01'} ({booking?.slot?.type || 'CAR'}) with sensor locking</span>
                  </td>
                  <td className="py-3 px-4 text-center">₹{hourlyRate.toFixed(2)}/hr</td>
                  <td className="py-3 px-4 text-center">{durationHours.toFixed(1)} hrs</td>
                  <td className="py-3 px-4 text-right font-semibold text-white">₹{baseSubtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">CGST (Central Goods & Services Tax @ 9%)</td>
                  <td className="py-2.5 px-4 text-center text-slate-500">9%</td>
                  <td className="py-2.5 px-4 text-center text-slate-500">—</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-300">₹{cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">SGST (Tamil Nadu State GST @ 9%)</td>
                  <td className="py-2.5 px-4 text-center text-slate-500">9%</td>
                  <td className="py-2.5 px-4 text-center text-slate-500">—</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-300">₹{sgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">GCC Smart Urban Grid Digital Cess</td>
                  <td className="py-2.5 px-4 text-center text-slate-500">0%</td>
                  <td className="py-2.5 px-4 text-center text-slate-500">—</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">₹0.00 (Waived)</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-950 font-bold border-t border-slate-800">
                <tr>
                  <td colSpan="3" className="py-3.5 px-4 text-right text-sm text-white">
                    Grand Total Payable (மொத்த கட்டணம்):
                  </td>
                  <td className="py-3.5 px-4 text-right text-lg text-brand-400 font-black">
                    ₹{grandTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Notice / Settlement Mode */}
          <div className="bg-sky-950/40 border border-sky-800/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-sky-200">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">
                Payment Settlement Mode: Invoiced / Pay on Exit or Counter (செலுத்துகை முறை)
              </span>
              <span>
                Payment gateway online checkout has been deferred for this booking. You can complete settlement directly at the facility gate barrier via UPI (GPay/PhonePe/Paytm) or Cash upon departure.
              </span>
            </div>
          </div>

          {/* QR Code Gate Access Pass */}
          {qrCode && (
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <img src={qrCode} alt="Terminal Entry QR" className="w-44 h-44 rounded-lg" />
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                  FAST-PASS BARRIER ACCESS TOKEN
                </span>
                <span className="font-mono font-bold text-brand-400 text-sm tracking-wider">
                  {booking?.qrToken}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Scan this QR code at Chennai MLCP entry barrier for seamless gate clearance.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-5 border-t border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between no-print">
          <Link
            to="/my-bookings"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← View All My Reservations
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <Link
              to={`/ticket/${booking?.id}`}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Digital Gate Pass</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
