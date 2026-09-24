import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

export default function RadarMap({
  latitude = 13.0405,
  longitude = 80.2337,
  name = 'Chennai Smart Parking Hub',
  address = '',
  markers = [],
  onMarkerClick,
  height = '350px',
}) {
  const mapContainerRef = useRef(null);
  const [googleMapLoaded, setGoogleMapLoaded] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) return;

    // Check if Google Maps script is already appended
    if (window.google && window.google.maps) {
      setGoogleMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (googleMapLoaded && mapContainerRef.current && window.google) {
      const center = { lat: Number(latitude), lng: Number(longitude) };
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 14,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0284c7' }] },
        ],
      });

      // Main pin
      new window.google.maps.Marker({
        position: center,
        map,
        title: name,
      });

      // Additional markers if provided
      markers.forEach((m) => {
        const marker = new window.google.maps.Marker({
          position: { lat: Number(m.latitude), lng: Number(m.longitude) },
          map,
          title: m.name,
        });

        if (onMarkerClick) {
          marker.addListener('click', () => onMarkerClick(m));
        }
      });
    }
  }, [googleMapLoaded, latitude, longitude, name, markers, onMarkerClick]);

  // If Google Maps is loaded and API key is present
  if (apiKey && googleMapLoaded) {
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    );
  }

  // Interactive Smart City Map Fallback with Grid Radar & Coordinate Targeting
  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative shadow-2xl flex flex-col justify-between p-6 select-none"
      style={{ height }}
    >
      {/* Background Geo Radar Mesh */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Ambient glowing radar circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-48 h-48 rounded-full border border-sky-400"></div>
        <div className="w-80 h-80 rounded-full border border-sky-500/40"></div>
        <div className="w-[450px] h-[450px] rounded-full border border-sky-600/20"></div>
      </div>

      {/* Top Map HUD */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-sky-400 font-mono">
          <Navigation className="w-3.5 h-3.5 text-brand-400" />
          <span>LAT: {latitude.toFixed(4)}° | LNG: {longitude.toFixed(4)}°</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Smart Radar Layer</span>
        </div>
      </div>

      {/* Center Target Marker */}
      <div className="flex flex-col items-center justify-center my-auto z-10 group cursor-pointer">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-brand-500/20 animate-ping absolute"></div>
          <div className="w-10 h-10 rounded-full bg-brand-600 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-brand-500/40 transform group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="font-bold text-sm text-white drop-shadow">{name}</div>
          {address && <div className="text-xs text-slate-400 max-w-xs truncate">{address}</div>}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 z-10">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live"></span>
          GPS Lock Acquired
        </span>
        <span className="text-[11px] text-slate-400">
          Google Maps SDK Ready
        </span>
      </div>
    </div>
  );
}
