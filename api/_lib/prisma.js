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
      name: 'K. Anbarasan (Commuter)',
      email: 'commuter@demo.com',
      password: passwordHash,
      role: 'COMMUTER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const owner = {
      id: 'usr_owner_01',
      name: 'Sundar Raman (Facility Partner)',
      email: 'owner@demo.com',
      password: passwordHash,
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const admin = {
      id: 'usr_admin_01',
      name: 'K. Rajeshwaran (Chennai City Admin)',
      email: 'admin@demo.com',
      password: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const masterAdmin = {
      id: 'usr_master_01',
      name: 'Dr. Mythili Velan (GCC Master Admin)',
      email: 'masteradmin@demo.com',
      password: passwordHash,
      role: 'MASTER_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users = [commuter, owner, admin, masterAdmin];

    // Seed Chennai, Tamil Nadu Parkings & Slots
    const p1 = {
      id: 'pkg_chn_01',
      name: 'T. Nagar Pondy Bazaar Smart MLCP',
      address: 'Panagal Park, Sir Thyagaraya Road, T. Nagar',
      city: 'Chennai',
      description: 'Greater Chennai Corporation (GCC) automated multi-level smart parking facility with 7 floors, automated car elevators, live sensor displays, and direct access to Pondy Bazaar Pedestrian Plaza.',
      latitude: 13.0405,
      longitude: 80.2337,
      imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const p2 = {
      id: 'pkg_chn_02',
      name: 'Velachery Phoenix & Grand Smart Hub',
      address: '142 Velachery Main Road, Indira Gandhi Nagar, Velachery',
      city: 'Chennai',
      description: 'Modern smart parking terminal with automated ANPR cameras, covered basement levels, 24/7 CCTV surveillance, and dedicated EV charging bays.',
      latitude: 12.9915,
      longitude: 80.2170,
      imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const p3 = {
      id: 'pkg_chn_03',
      name: 'Marina Beach & Light House Metro Hub',
      address: 'Kamarajar Promenade, Triplicane, Marina Beach',
      city: 'Chennai',
      description: 'High-capacity beachside smart parking facility equipped with dynamic LED guidance, solar shaded stalls, automated barrier gates, and pedestrian walkways.',
      latitude: 13.0499,
      longitude: 80.2824,
      imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const p4 = {
      id: 'pkg_chn_04',
      name: 'Anna Salai Express Avenue Central Hub',
      address: 'Whites Road, Royapettah / Anna Salai (Near Thousand Lights Metro)',
      city: 'Chennai',
      description: 'Central Chennai prime parking zone with contactless RFID fast entry, multi-tier security, valet assistance, and round-the-clock power backup.',
      latitude: 13.0587,
      longitude: 80.2609,
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const p5 = {
      id: 'pkg_chn_05',
      name: 'CMBT Koyambedu Integrated Transit Hub',
      address: 'Inner Ring Road, Koyambedu, Chennai - 600107',
      city: 'Chennai',
      description: 'Integrated multimodal transit parking facility catering to intercity travelers, metro commuters, and suburban bus passengers.',
      latitude: 13.0694,
      longitude: 80.1948,
      imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.parkings = [p1, p2, p3, p4, p5];

    // Slots for p1 (T. Nagar)
    this.slots.push(
      { id: 's_101', parkingId: p1.id, code: 'TN-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 40.0 },
      { id: 's_102', parkingId: p1.id, code: 'TN-02', type: 'CAR', status: 'OCCUPIED', pricePerHour: 40.0 },
      { id: 's_103', parkingId: p1.id, code: 'TN-03', type: 'CAR', status: 'AVAILABLE', pricePerHour: 40.0 },
      { id: 's_104', parkingId: p1.id, code: 'TN-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 60.0 },
      { id: 's_105', parkingId: p1.id, code: 'TN-E2', type: 'EV', status: 'RESERVED', pricePerHour: 60.0 },
      { id: 's_106', parkingId: p1.id, code: 'TN-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 15.0 },
      { id: 's_107', parkingId: p1.id, code: 'TN-B2', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 15.0 },
      { id: 's_108', parkingId: p1.id, code: 'TN-04', type: 'CAR', status: 'MAINTENANCE', pricePerHour: 40.0 }
    );

    // Slots for p2 (Velachery Phoenix)
    this.slots.push(
      { id: 's_201', parkingId: p2.id, code: 'VLC-101', type: 'CAR', status: 'AVAILABLE', pricePerHour: 50.0 },
      { id: 's_202', parkingId: p2.id, code: 'VLC-102', type: 'CAR', status: 'AVAILABLE', pricePerHour: 50.0 },
      { id: 's_203', parkingId: p2.id, code: 'VLC-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 75.0 },
      { id: 's_204', parkingId: p2.id, code: 'VLC-E2', type: 'EV', status: 'OCCUPIED', pricePerHour: 75.0 },
      { id: 's_205', parkingId: p2.id, code: 'VLC-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 20.0 }
    );

    // Slots for p3 (Marina Beach)
    this.slots.push(
      { id: 's_301', parkingId: p3.id, code: 'MRN-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 30.0 },
      { id: 's_302', parkingId: p3.id, code: 'MRN-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 30.0 },
      { id: 's_303', parkingId: p3.id, code: 'MRN-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 50.0 },
      { id: 's_304', parkingId: p3.id, code: 'MRN-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 10.0 }
    );

    // Slots for p4 (Anna Salai EA)
    this.slots.push(
      { id: 's_401', parkingId: p4.id, code: 'ANS-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 45.0 },
      { id: 's_402', parkingId: p4.id, code: 'ANS-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 45.0 },
      { id: 's_403', parkingId: p4.id, code: 'ANS-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 65.0 },
      { id: 's_404', parkingId: p4.id, code: 'ANS-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 15.0 }
    );

    // Slots for p5 (CMBT Koyambedu)
    this.slots.push(
      { id: 's_501', parkingId: p5.id, code: 'CMB-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 35.0 },
      { id: 's_502', parkingId: p5.id, code: 'CMB-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 35.0 },
      { id: 's_503', parkingId: p5.id, code: 'CMB-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 55.0 },
      { id: 's_504', parkingId: p5.id, code: 'CMB-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 10.0 }
    );

    // Initial Booking
    const bk1 = {
      id: 'bk_sample_01',
      userId: commuter.id,
      parkingId: p1.id,
      slotId: 's_105',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      amount: 120.0,
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
  // Test connection to Database (MongoDB & relational compatible)
  async testConnection() {
    if (!rawPrisma) return false;
    try {
      await rawPrisma.systemSetting.findFirst();
      isPrismaConnected = true;
      return true;
    } catch {
      isPrismaConnected = false;
      return false;
    }
  },

  user: {
    async findFirst({ where = {}, select }) {
      if (isPrismaConnected && rawPrisma) {
        try { return await rawPrisma.user.findFirst({ where, select }); } catch {}
      }
      let found = local.users[0];
      if (where.role) found = local.users.find(u => u.role === where.role) || found;
      if (where.email) found = local.users.find(u => u.email.toLowerCase() === where.email.toLowerCase()) || found;
      if (!found) return null;
      if (!select) return found;
      const res = {};
      Object.keys(select).forEach(k => { if (select[k]) res[k] = found[k]; });
      return res;
    },
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
