import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

let rawPrisma = null;
let isPrismaConnected = false;

// Attempt to initialize Prisma Client
try {
  rawPrisma = new PrismaClient({
    log: ['error'],
  });
} catch (e) {
  console.warn('Prisma initialization warning:', e.message);
}

// In-Memory Fallback Store (Used when Neon Postgres is offline or credentials not yet linked)
class LocalStore {
  constructor() {
    this.users = [];
    this.parkings = [];
    this.slots = [];
    this.bookings = [];
    this.auditLogs = [];
    this.settings = new Map();
    this.initDefaultSeed();
  }

  async initDefaultSeed() {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const commuter = {
      id: 'usr_commuter_01',
      name: 'Alex Rivera (Commuter)',
      email: 'commuter@demo.com',
      password: passwordHash,
      role: 'COMMUTER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const owner = {
      id: 'usr_owner_01',
      name: 'Elena Rostova (Parking Owner)',
      email: 'owner@demo.com',
      password: passwordHash,
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const admin = {
      id: 'usr_admin_01',
      name: 'Marcus Vance (City Admin)',
      email: 'admin@demo.com',
      password: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const masterAdmin = {
      id: 'usr_master_01',
      name: 'Sophia Thorne (Master Administrator)',
      email: 'masteradmin@demo.com',
      password: passwordHash,
      role: 'MASTER_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users = [commuter, owner, admin, masterAdmin];

    // Seed Parkings & Slots
    const p1 = {
      id: 'pkg_sf_01',
      name: 'Metroplex Central Tower Parking',
      address: '450 Mission Street, Financial District',
      city: 'San Francisco',
      description: 'Underground multi-level secure parking with automated license plate recognition, 24/7 CCTV, and high-speed EV chargers.',
      latitude: 37.7909,
      longitude: -122.3999,
      imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const p2 = {
      id: 'pkg_ny_01',
      name: 'Grand Central Smart Hub',
      address: '100 East 42nd St, Midtown',
      city: 'New York',
      description: 'Prime Midtown Manhattan multi-tiered parking terminal right beside Grand Central. Fully climate controlled with valet assistance.',
      latitude: 40.7516,
      longitude: -73.9772,
      imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const p3 = {
      id: 'pkg_sea_01',
      name: 'Pike Place Harbor Garage',
      address: '1531 Western Ave, Waterfront',
      city: 'Seattle',
      description: 'Convenient covered parking near waterfront dining, Pike Place Market, and ferry docks with solar-powered charging stalls.',
      latitude: 47.6085,
      longitude: -122.3402,
      imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const p4 = {
      id: 'pkg_blr_01',
      name: 'Silicon Hub Tech Plaza',
      address: '100 Feet Ring Road, Indiranagar',
      city: 'Bangalore',
      description: 'Modern urban parking facility with biometric entry, shaded bays, and fast 60kW DC EV fast chargers.',
      latitude: 12.9716,
      longitude: 77.5946,
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.parkings = [p1, p2, p3, p4];

    // Slots for p1
    this.slots.push(
      { id: 's_101', parkingId: p1.id, code: 'A-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 8.5 },
      { id: 's_102', parkingId: p1.id, code: 'A-02', type: 'CAR', status: 'OCCUPIED', pricePerHour: 8.5 },
      { id: 's_103', parkingId: p1.id, code: 'A-03', type: 'CAR', status: 'AVAILABLE', pricePerHour: 8.5 },
      { id: 's_104', parkingId: p1.id, code: 'A-04', type: 'EV', status: 'AVAILABLE', pricePerHour: 12.0 },
      { id: 's_105', parkingId: p1.id, code: 'A-05', type: 'EV', status: 'RESERVED', pricePerHour: 12.0 },
      { id: 's_106', parkingId: p1.id, code: 'B-01', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 3.0 },
      { id: 's_107', parkingId: p1.id, code: 'B-02', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 3.0 },
      { id: 's_108', parkingId: p1.id, code: 'B-03', type: 'CAR', status: 'MAINTENANCE', pricePerHour: 8.5 }
    );

    // Slots for p2
    this.slots.push(
      { id: 's_201', parkingId: p2.id, code: 'NY-101', type: 'CAR', status: 'AVAILABLE', pricePerHour: 14.0 },
      { id: 's_202', parkingId: p2.id, code: 'NY-102', type: 'CAR', status: 'AVAILABLE', pricePerHour: 14.0 },
      { id: 's_203', parkingId: p2.id, code: 'NY-103', type: 'EV', status: 'AVAILABLE', pricePerHour: 18.0 },
      { id: 's_204', parkingId: p2.id, code: 'NY-104', type: 'EV', status: 'OCCUPIED', pricePerHour: 18.0 },
      { id: 's_205', parkingId: p2.id, code: 'NY-BK1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 5.0 }
    );

    // Slots for p3
    this.slots.push(
      { id: 's_301', parkingId: p3.id, code: 'SEA-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 7.0 },
      { id: 's_302', parkingId: p3.id, code: 'SEA-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 7.0 },
      { id: 's_303', parkingId: p3.id, code: 'SEA-03', type: 'EV', status: 'AVAILABLE', pricePerHour: 10.5 },
      { id: 's_304', parkingId: p3.id, code: 'SEA-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 2.5 }
    );

    // Slots for p4
    this.slots.push(
      { id: 's_401', parkingId: p4.id, code: 'BLR-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 4.0 },
      { id: 's_402', parkingId: p4.id, code: 'BLR-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 4.0 },
      { id: 's_403', parkingId: p4.id, code: 'BLR-03', type: 'EV', status: 'AVAILABLE', pricePerHour: 6.5 },
      { id: 's_404', parkingId: p4.id, code: 'BLR-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 1.5 }
    );

    // Initial Booking
    const bk1 = {
      id: 'bk_sample_01',
      userId: commuter.id,
      parkingId: p1.id,
      slotId: 's_105',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      amount: 24.0,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      qrToken: 'PS-TK-DEMO99482103',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.push(bk1);

    // Initial Audit Log
    this.auditLogs.push({
      id: 'aud_seed_01',
      actorId: masterAdmin.id,
      action: 'SYSTEM_SEED_INITIALIZED',
      target: 'SYSTEM',
      metadata: { note: 'Initial local/production runtime seed active' },
      createdAt: new Date(),
    });

    // Initial System Config
    this.settings.set('global_config', {
      maintenanceMode: false,
      platformFeePercentage: 5,
      defaultCancellationWindowMinutes: 30,
      enableInstantRefunds: true,
      featureFlags: {
        evChargingDiscount: true,
        instantQrScanning: true,
        surgePricing: false,
      },
    });
  }
}

const local = new LocalStore();

// Create the resilient proxy client
const db = {
  // Test connection to Postgres
  async testConnection() {
    if (!rawPrisma) return false;
    try {
      await rawPrisma.$queryRaw`SELECT 1`;
      isPrismaConnected = true;
      return true;
    } catch {
      isPrismaConnected = false;
      return false;
    }
  },

  user: {
    async findUnique({ where, select }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.user.findUnique({ where, select }); } catch {}
      }
      let found = null;
      if (where.id) found = local.users.find(u => u.id === where.id);
      if (where.email) found = local.users.find(u => u.email.toLowerCase() === where.email.toLowerCase());
      if (!found) return null;
      if (!select) return found;
      const res = {};
      Object.keys(select).forEach(k => { if (select[k]) res[k] = found[k]; });
      return res;
    },
    async create({ data, select }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.user.create({ data, select }); } catch {}
      }
      const u = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      local.users.push(u);
      return select ? { id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, createdAt: u.createdAt } : u;
    },
    async findMany({ where = {}, select, orderBy }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.user.findMany({ where, select, orderBy }); } catch {}
      }
      let list = [...local.users];
      if (where.role) list = list.filter(u => u.role === where.role);
      if (where.status) list = list.filter(u => u.status === where.status);
      if (where.OR) {
        const term = where.OR[0]?.name?.contains?.toLowerCase() || '';
        list = list.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
      }
      return list.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        _count: {
          bookings: local.bookings.filter(b => b.userId === u.id).length,
          parkings: local.parkings.filter(p => p.ownerId === u.id).length,
        },
      }));
    },
    async update({ where, data, select }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.user.update({ where, data, select }); } catch {}
      }
      const u = local.users.find(x => x.id === where.id);
      if (!u) throw new Error('User not found');
      Object.assign(u, data, { updatedAt: new Date() });
      return select ? { id: u.id, name: u.name, email: u.email, role: u.role, status: u.status } : u;
    },
    async delete({ where }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.user.delete({ where }); } catch {}
      }
      const idx = local.users.findIndex(x => x.id === where.id);
      if (idx !== -1) local.users.splice(idx, 1);
      return { success: true };
    },
    async count({ where = {} } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.user.count({ where }); } catch {}
      }
      let list = local.users;
      if (where.role) {
        if (typeof where.role === 'string') list = list.filter(u => u.role === where.role);
        else if (where.role.in) list = list.filter(u => where.role.in.includes(u.role));
      }
      return list.length;
    },
    async upsert({ where, create, update }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.user.upsert({ where, create, update }); } catch {}
      }
      let u = local.users.find(x => x.email === where.email);
      if (!u) {
        u = { id: `usr_${Date.now()}`, ...create, createdAt: new Date(), updatedAt: new Date() };
        local.users.push(u);
      }
      return u;
    }
  },

  parking: {
    async findMany({ where = {}, include, orderBy } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.parking.findMany({ where, include, orderBy }); } catch {}
      }
      let list = [...local.parkings];
      if (where.ownerId) list = list.filter(p => p.ownerId === where.ownerId);
      if (where.city && where.city.contains) {
        list = list.filter(p => p.city.toLowerCase().includes(where.city.contains.toLowerCase()));
      }
      if (where.OR) {
        const q = where.OR[0]?.name?.contains?.toLowerCase() || '';
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
      }
      if (where.slots?.some?.type) {
        const t = where.slots.some.type;
        list = list.filter(p => local.slots.some(s => s.parkingId === p.id && s.type === t));
      }

      return list.map(p => {
        const pSlots = local.slots.filter(s => s.parkingId === p.id);
        const pOwner = local.users.find(u => u.id === p.ownerId) || { id: p.ownerId, name: 'Facility Operator', email: 'owner@demo.com' };
        const pBookings = local.bookings.filter(b => b.parkingId === p.id).map(b => ({
          ...b,
          user: local.users.find(u => u.id === b.userId) || { id: b.userId, name: 'Driver', email: '' },
          slot: local.slots.find(s => s.id === b.slotId),
        }));

        const res = { ...p, slots: pSlots, owner: pOwner };
        if (include?.bookings) res.bookings = pBookings;
        if (include?._count) {
          res._count = { slots: pSlots.length, bookings: pBookings.length };
        }
        return res;
      });
    },
    async findUnique({ where, include }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.parking.findUnique({ where, include }); } catch {}
      }
      const p = local.parkings.find(x => x.id === where.id);
      if (!p) return null;
      const pSlots = local.slots.filter(s => s.parkingId === p.id);
      const pOwner = local.users.find(u => u.id === p.ownerId);
      return { ...p, slots: pSlots, owner: pOwner };
    },
    async findFirst({ where } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.parking.findFirst({ where }); } catch {}
      }
      if (where?.name) return local.parkings.find(p => p.name === where.name) || null;
      return local.parkings[0] || null;
    },
    async create({ data, include }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.parking.create({ data, include }); } catch {}
      }
      const p = {
        id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: data.name,
        address: data.address,
        city: data.city,
        description: data.description || '',
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        imageUrl: data.imageUrl || null,
        ownerId: data.ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      local.parkings.push(p);

      if (data.slots?.create) {
        data.slots.create.forEach(sData => {
          local.slots.push({
            id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            parkingId: p.id,
            code: sData.code,
            type: sData.type,
            status: sData.status || 'AVAILABLE',
            pricePerHour: Number(sData.pricePerHour),
          });
        });
      }

      const pSlots = local.slots.filter(s => s.parkingId === p.id);
      return { ...p, slots: pSlots };
    },
    async update({ where, data }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.parking.update({ where, data }); } catch {}
      }
      const p = local.parkings.find(x => x.id === where.id);
      if (!p) throw new Error('Parking not found');
      Object.assign(p, data, { updatedAt: new Date() });
      return p;
    },
    async delete({ where }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.parking.delete({ where }); } catch {}
      }
      const idx = local.parkings.findIndex(x => x.id === where.id);
      if (idx !== -1) local.parkings.splice(idx, 1);
      local.slots = local.slots.filter(s => s.parkingId !== where.id);
      return { success: true };
    },
    async count() {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.parking.count(); } catch {}
      }
      return local.parkings.length;
    },
    async groupBy({ by, _count }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.parking.groupBy({ by, _count }); } catch {}
      }
      const cities = Array.from(new Set(local.parkings.map(p => p.city)));
      return cities.map(c => ({
        city: c,
        _count: { id: local.parkings.filter(p => p.city === c).length },
      }));
    }
  },

  slot: {
    async findMany({ where = {}, orderBy } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.slot.findMany({ where, orderBy }); } catch {}
      }
      let list = [...local.slots];
      if (where.parkingId) list = list.filter(s => s.parkingId === where.parkingId);
      if (where.status) {
        if (typeof where.status === 'string') list = list.filter(s => s.status === where.status);
        else if (where.status.in) list = list.filter(s => where.status.in.includes(s.status));
      }
      return list;
    },
    async findUnique({ where, include }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.slot.findUnique({ where, include }); } catch {}
      }
      const s = local.slots.find(x => x.id === where.id);
      if (!s) return null;
      const res = { ...s };
      if (include?.parking) {
        res.parking = local.parkings.find(p => p.id === s.parkingId);
      }
      return res;
    },
    async findFirst({ where } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.slot.findFirst({ where }); } catch {}
      }
      return local.slots.find(s => {
        if (where.parkingId && s.parkingId !== where.parkingId) return false;
        if (where.code && s.code !== where.code) return false;
        return true;
      }) || null;
    },
    async create({ data }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.slot.create({ data }); } catch {}
      }
      const s = {
        id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...data,
      };
      local.slots.push(s);
      return s;
    },
    async update({ where, data }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.slot.update({ where, data }); } catch {}
      }
      const s = local.slots.find(x => x.id === where.id);
      if (!s) throw new Error('Slot not found');
      Object.assign(s, data);
      return s;
    },
    async delete({ where }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.slot.delete({ where }); } catch {}
      }
      const idx = local.slots.findIndex(x => x.id === where.id);
      if (idx !== -1) local.slots.splice(idx, 1);
      return { success: true };
    },
    async count({ where = {} } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.slot.count({ where }); } catch {}
      }
      let list = local.slots;
      if (where.status) {
        if (typeof where.status === 'string') list = list.filter(s => s.status === where.status);
        else if (where.status.in) list = list.filter(s => where.status.in.includes(s.status));
      }
      return list.length;
    }
  },

  booking: {
    async findMany({ where = {}, include, orderBy } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.booking.findMany({ where, include, orderBy }); } catch {}
      }
      let list = [...local.bookings];
      if (where.userId) list = list.filter(b => b.userId === where.userId);
      if (where.parkingId) list = list.filter(b => b.parkingId === where.parkingId);
      if (where.parking?.city) {
        list = list.filter(b => {
          const p = local.parkings.find(x => x.id === b.parkingId);
          return p && p.city === where.parking.city;
        });
      }
      if (where.paymentStatus) list = list.filter(b => b.paymentStatus === where.paymentStatus);

      return list.map(b => ({
        ...b,
        parking: local.parkings.find(p => p.id === b.parkingId),
        slot: local.slots.find(s => s.id === b.slotId),
        user: local.users.find(u => u.id === b.userId) || { id: b.userId, name: 'Driver', email: '' },
      }));
    },
    async findUnique({ where, include }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.booking.findUnique({ where, include }); } catch {}
      }
      const b = local.bookings.find(x => x.id === where.id);
      if (!b) return null;
      return {
        ...b,
        parking: local.parkings.find(p => p.id === b.parkingId),
        slot: local.slots.find(s => s.id === b.slotId),
        user: local.users.find(u => u.id === b.userId) || { id: b.userId, name: 'Driver', email: '' },
      };
    },
    async findFirst({ where } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.booking.findFirst({ where }); } catch {}
      }
      return local.bookings.find(b => {
        if (where.slotId && b.slotId !== where.slotId) return false;
        if (where.status?.in && !where.status.in.includes(b.status)) return false;
        return true;
      }) || null;
    },
    async create({ data, include }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.booking.create({ data, include }); } catch {}
      }
      const b = {
        id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      local.bookings.push(b);
      return {
        ...b,
        parking: local.parkings.find(p => p.id === b.parkingId),
        slot: local.slots.find(s => s.id === b.slotId),
        user: local.users.find(u => u.id === b.userId),
      };
    },
    async update({ where, data, include }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.booking.update({ where, data, include }); } catch {}
      }
      const b = local.bookings.find(x => x.id === where.id);
      if (!b) throw new Error('Booking not found');
      Object.assign(b, data, { updatedAt: new Date() });
      return {
        ...b,
        parking: local.parkings.find(p => p.id === b.parkingId),
        slot: local.slots.find(s => s.id === b.slotId),
        user: local.users.find(u => u.id === b.userId),
      };
    },
    async count({ where = {} } = {}) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.booking.count({ where }); } catch {}
      }
      let list = local.bookings;
      if (where.parking?.city) {
        list = list.filter(b => {
          const p = local.parkings.find(x => x.id === b.parkingId);
          return p && p.city === where.parking.city;
        });
      }
      return list.length;
    },
    async aggregate({ where = {}, _sum }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.booking.aggregate({ where, _sum }); } catch {}
      }
      let list = local.bookings;
      if (where.paymentStatus) list = list.filter(b => b.paymentStatus === where.paymentStatus);
      if (where.parking?.city) {
        list = list.filter(b => {
          const p = local.parkings.find(x => x.id === b.parkingId);
          return p && p.city === where.parking.city;
        });
      }
      const sum = list.reduce((total, b) => total + (b.amount || 0), 0);
      return { _sum: { amount: sum } };
    }
  },

  auditLog: {
    async create({ data }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.auditLog.create({ data }); } catch {}
      }
      const item = {
        id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...data,
        createdAt: new Date(),
      };
      local.auditLogs.unshift(item);
      return item;
    },
    async findMany({ where = {}, include, orderBy, take }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.auditLog.findMany({ where, include, orderBy, take }); } catch {}
      }
      let list = [...local.auditLogs];
      if (where.action?.contains) {
        list = list.filter(a => a.action.toLowerCase().includes(where.action.contains.toLowerCase()));
      }
      if (where.target?.contains) {
        list = list.filter(a => a.target.toLowerCase().includes(where.target.contains.toLowerCase()));
      }
      return list.slice(0, take || 100).map(a => ({
        ...a,
        actor: local.users.find(u => u.id === a.actorId) || { id: a.actorId, name: 'Administrator', email: 'admin@demo.com', role: 'ADMIN' },
      }));
    },
    async count() {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.auditLog.count(); } catch {}
      }
      return local.auditLogs.length;
    }
  },

  systemSetting: {
    async findUnique({ where }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.systemSetting.findUnique({ where }); } catch {}
      }
      const val = local.settings.get(where.key);
      return val ? { key: where.key, value: val } : null;
    },
    async upsert({ where, create, update }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.systemSetting.upsert({ where, create, update }); } catch {}
      }
      const val = update.value || create.value;
      local.settings.set(where.key, val);
      return { key: where.key, value: val };
    }
  },

  async $transaction(fn) {
    if (isPrismaConnected && rawPrisma) {
      try {
        return await rawPrisma.$transaction(fn);
      } catch (err) {
        console.warn('Prisma transaction encountered error, attempting safe fallback:', err.message);
      }
    }
    // Execute callback with the proxy client
    return await fn(db);
  },

  async $disconnect() {
    if (rawPrisma) {
      try { await rawPrisma.$disconnect(); } catch {}
    }
  }
};

// Check connection once at startup
db.testConnection().catch(() => {});

export default db;
