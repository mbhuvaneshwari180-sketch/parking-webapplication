import React, { useState, useEffect } from 'react';
import { parkingAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  MapPin, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function ParkingManagementPage() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetParking, setTargetParking] = useState(null);
  const [targetSlot, setTargetSlot] = useState(null);

  // New Parking Form State
  const [newParking, setNewParking] = useState({
    name: '',
    address: '',
    city: 'Chennai',
    description: '',
    latitude: 13.0405,
    longitude: 80.2337,
    imageUrl: '',
  });

  // Cloudinary Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);

  // New Slot Form State
  const [newSlot, setNewSlot] = useState({
    code: '',
    type: 'CAR',
    pricePerHour: 40.0,
    status: 'AVAILABLE',
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchOwnerParkings = async () => {
    try {
      const res = await parkingAPI.getAll();
      setParkings(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch parking locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerParkings();
  }, []);

  // Handle local image file upload directly to backend / Cloudinary
  const handleImageFileChange = async (e, parkingId = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      try {
        if (parkingId) {
          // Upload directly for an existing parking
          const res = await parkingAPI.uploadImage(parkingId, base64Data);
          await fetchOwnerParkings();
          alert('Photo uploaded to Cloudinary successfully!');
        } else {
          // Pre-set data URI for new parking creation
          setNewParking((prev) => ({ ...prev, imageUrl: base64Data }));
        }
      } catch (err) {
        alert('Failed to upload image to Cloudinary');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateParking = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await parkingAPI.create({
        ...newParking,
        latitude: parseFloat(newParking.latitude),
        longitude: parseFloat(newParking.longitude),
      });
      setCreateModalOpen(false);
      setNewParking({
        name: '',
        address: '',
        city: 'Chennai',
        description: '',
        latitude: 13.0405,
        longitude: 80.2337,
        imageUrl: '',
      });
      await fetchOwnerParkings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create parking location');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!targetParking) return;
    setActionLoading(true);
    try {
      await parkingAPI.addSlot(targetParking.id, {
        code: newSlot.code.toUpperCase(),
        type: newSlot.type,
        pricePerHour: parseFloat(newSlot.pricePerHour),
        status: newSlot.status,
      });
      setSlotModalOpen(false);
      setNewSlot({ code: '', type: 'CAR', pricePerHour: 10.0, status: 'AVAILABLE' });
      await fetchOwnerParkings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add slot');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSlotStatus = async (slotId, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    try {
      await parkingAPI.updateSlot(slotId, { status: nextStatus });
      await fetchOwnerParkings();
    } catch (err) {
      alert('Failed to update slot status');
    }
  };

  const handleDeleteParkingConfirm = async () => {
    if (!targetParking) return;
    setActionLoading(true);
    try {
      await parkingAPI.delete(targetParking.id);
      setDeleteModalOpen(false);
      setTargetParking(null);
      await fetchOwnerParkings();
    } catch (err) {
      alert('Failed to delete parking location');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Parking Terminals</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Add locations, upload photos to Cloudinary, and configure bay inventory and status
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Parking Terminal</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading facility inventory...</p>
        </div>
      ) : parkings.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No parking facilities registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by adding your first urban parking location with custom stalls and Cloudinary photo.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
          >
            Create Facility Now
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {parkings.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6"
            >
              {/* Parking Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=300&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{p.name}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      {p.address}, {p.city}
                    </p>
                  </div>
                </div>

                {/* Top Facility Actions */}
                <div className="flex items-center gap-2">
                  {/* Direct Cloudinary upload input */}
                  <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>{uploadingImage ? 'Uploading...' : 'Update Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, p.id)}
                    />
                  </label>

                  <button
                    onClick={() => {
                      setTargetParking(p);
                      setSlotModalOpen(true);
                    }}
                    className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bay</span>
                  </button>

                  <button
                    onClick={() => {
                      setTargetParking(p);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 rounded-xl text-xs transition-colors"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">
                    Bays Inventory ({p.slots?.length || 0} stalls)
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Click any stall to toggle Maintenance Mode
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                  {p.slots?.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSlotStatus(s.id, s.status)}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 select-none ${
                        s.status === 'AVAILABLE'
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                          : s.status === 'OCCUPIED'
                          ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                          : s.status === 'RESERVED'
                          ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                      title="Click to toggle Available / Maintenance"
                    >
                      <div className="font-mono font-bold text-sm text-white">{s.code}</div>
                      <div className="text-[10px] text-slate-400">{s.type}</div>
                      <div className="text-[10px] font-semibold text-white mt-1">₹{s.pricePerHour}/hr</div>
                      <div className="text-[9px] uppercase font-bold mt-1 tracking-wider opacity-80">
                        {s.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Parking Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Add New Parking Terminal</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParking} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Terminal Name</label>
                <input
                  type="text"
                  required
                  value={newParking.name}
                  onChange={(e) => setNewParking({ ...newParking, name: e.target.value })}
                  placeholder="e.g. Downtown Central Garage"
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={newParking.city}
                    onChange={(e) => setNewParking({ ...newParking, city: e.target.value })}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Address</label>
                  <input
                    type="text"
                    required
                    value={newParking.address}
                    onChange={(e) => setNewParking({ ...newParking, address: e.target.value })}
                    placeholder="123 Market St"
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newParking.latitude}
                    onChange={(e) => setNewParking({ ...newParking, latitude: e.target.value })}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newParking.longitude}
                    onChange={(e) => setNewParking({ ...newParking, longitude: e.target.value })}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows="2"
                  value={newParking.description}
                  onChange={(e) => setNewParking({ ...newParking, description: e.target.value })}
                  placeholder="Security features, EV charging bays, overhead clearance..."
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span>Photo (Upload to Cloudinary or Paste URL)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newParking.imageUrl}
                    onChange={(e) => setNewParking({ ...newParking, imageUrl: e.target.value })}
                    placeholder="https://... or choose file"
                    className="flex-1 bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium flex items-center gap-1 border border-slate-700">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  {actionLoading ? 'Creating...' : 'Create Terminal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {slotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Bay to {targetParking?.name}</h3>
              <button onClick={() => setSlotModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Bay Code</label>
                <input
                  type="text"
                  required
                  value={newSlot.code}
                  onChange={(e) => setNewSlot({ ...newSlot, code: e.target.value })}
                  placeholder="e.g. C-12 or EV-04"
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 uppercase font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Vehicle Bay Type</label>
                <select
                  value={newSlot.type}
                  onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700"
                >
                  <option value="CAR">Car</option>
                  <option value="BIKE">Motorcycle / Bike</option>
                  <option value="EV">Electric Vehicle (EV Stall)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Rate ($ per hour)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newSlot.pricePerHour}
                  onChange={(e) => setNewSlot({ ...newSlot, pricePerHour: e.target.value })}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-700 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSlotModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  {actionLoading ? 'Adding...' : 'Add Bay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Parking Terminal"
        message={`Are you sure you want to permanently delete "${targetParking?.name}"? All associated slots and records will be deleted.`}
        confirmText="Delete Terminal"
        isDanger={true}
        isLoading={actionLoading}
        onConfirm={handleDeleteParkingConfirm}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
