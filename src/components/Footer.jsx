import React from 'react';
import { ParkingCircle, Shield, Radio, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ParkingCircle className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">ParkingSpot</span>
            </div>
            <p className="text-sm text-slate-400">
              Next-generation smart parking management infrastructure. Real-time availability, dynamic pricing, and seamless digital reservations.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 radar-live"></span>
              All systems operational – Live Polling Active
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/parkings" className="hover:text-white transition-colors">Find Parking</a></li>
              <li><a href="/my-bookings" className="hover:text-white transition-colors">Digital Passes & QR</a></li>
              <li><a href="/owner/dashboard" className="hover:text-white transition-colors">Owner Operations</a></li>
              <li><a href="/admin/dashboard" className="hover:text-white transition-colors">City Municipal Portal</a></li>
            </ul>
          </div>

          {/* Tech & Infrastructure */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-brand-400" /> Neon Serverless Postgres</li>
              <li className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-emerald-400" /> Real-time Polling Sync (3s)</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> Cloudinary Asset Storage</li>
              <li>Prisma Transactional Locking</li>
            </ul>
          </div>

          {/* Security & Roles */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Compliance</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Strict role-based authorization: Commuter, Owner, Admin, and Master Admin. Cryptographically signed booking tokens and server-side HMAC validation.
            </p>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} ParkingSpot Platform. Vercel Serverless Ready.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
