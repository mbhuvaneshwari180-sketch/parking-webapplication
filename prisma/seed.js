import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed or Upsert Demo Users
  const commuter = await prisma.user.upsert({
    where: { email: 'commuter@demo.com' },
    update: {},
    create: {
      name: 'Alex Rivera (Commuter)',
      email: 'commuter@demo.com',
      password: passwordHash,
      role: 'COMMUTER',
      status: 'ACTIVE',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      name: 'Elena Rostova (Parking Owner)',
      email: 'owner@demo.com',
      password: passwordHash,
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Marcus Vance (City Admin)',
      email: 'admin@demo.com',
      password: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const masterAdmin = await prisma.user.upsert({
    where: { email: 'masteradmin@demo.com' },
    update: {},
    create: {
      name: 'Sophia Thorne (Master Administrator)',
      email: 'masteradmin@demo.com',
      password: passwordHash,
      role: 'MASTER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✓ Users created / verified:');
  console.log(`  - Commuter: ${commuter.email}`);
  console.log(`  - Owner: ${owner.email}`);
  console.log(`  - Admin: ${admin.email}`);
  console.log(`  - Master Admin: ${masterAdmin.email}`);

  // 2. Seed Default System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'global_config' },
    update: {},
    create: {
      key: 'global_config',
      value: {
        maintenanceMode: false,
        platformFeePercentage: 5,
        defaultCancellationWindowMinutes: 30,
        enableInstantRefunds: true,
        featureFlags: {
          evChargingDiscount: true,
          instantQrScanning: true,
          surgePricing: false,
        },
      },
    },
  });

  // 3. Seed Realistic Parking Locations
  const parkingsData = [
    {
      name: 'Metroplex Central Tower Parking',
      address: '450 Mission Street, Financial District',
      city: 'San Francisco',
      description: 'Underground multi-level secure parking with automated license plate recognition, 24/7 CCTV, and high-speed EV chargers.',
      latitude: 37.7909,
      longitude: -122.3999,
      imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'A-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 8.5 },
        { code: 'A-02', type: 'CAR', status: 'OCCUPIED', pricePerHour: 8.5 },
        { code: 'A-03', type: 'CAR', status: 'AVAILABLE', pricePerHour: 8.5 },
        { code: 'A-04', type: 'EV', status: 'AVAILABLE', pricePerHour: 12.0 },
        { code: 'A-05', type: 'EV', status: 'RESERVED', pricePerHour: 12.0 },
        { code: 'B-01', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 3.0 },
        { code: 'B-02', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 3.0 },
        { code: 'B-03', type: 'CAR', status: 'MAINTENANCE', pricePerHour: 8.5 },
      ],
    },
    {
      name: 'Grand Central Smart Hub',
      address: '100 East 42nd St, Midtown',
      city: 'New York',
      description: 'Prime Midtown Manhattan multi-tiered parking terminal right beside Grand Central. Fully climate controlled with valet assistance.',
      latitude: 40.7516,
      longitude: -73.9772,
      imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'NY-101', type: 'CAR', status: 'AVAILABLE', pricePerHour: 14.0 },
        { code: 'NY-102', type: 'CAR', status: 'AVAILABLE', pricePerHour: 14.0 },
        { code: 'NY-103', type: 'EV', status: 'AVAILABLE', pricePerHour: 18.0 },
        { code: 'NY-104', type: 'EV', status: 'OCCUPIED', pricePerHour: 18.0 },
        { code: 'NY-BK1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 5.0 },
        { code: 'NY-105', type: 'CAR', status: 'RESERVED', pricePerHour: 14.0 },
      ],
    },
    {
      name: 'Pike Place Harbor Garage',
      address: '1531 Western Ave, Waterfront',
      city: 'Seattle',
      description: 'Convenient covered parking near waterfront dining, Pike Place Market, and ferry docks with solar-powered charging stalls.',
      latitude: 47.6085,
      longitude: -122.3402,
      imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'SEA-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 7.0 },
        { code: 'SEA-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 7.0 },
        { code: 'SEA-03', type: 'EV', status: 'AVAILABLE', pricePerHour: 10.5 },
        { code: 'SEA-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 2.5 },
      ],
    },
    {
      name: 'Silicon Hub Tech Plaza',
      address: '100 Feet Ring Road, Indiranagar',
      city: 'Bangalore',
      description: 'Modern urban parking facility with biometric entry, shaded bays, and fast 60kW DC EV fast chargers.',
      latitude: 12.9716,
      longitude: 77.5946,
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'BLR-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 4.0 },
        { code: 'BLR-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 4.0 },
        { code: 'BLR-03', type: 'EV', status: 'AVAILABLE', pricePerHour: 6.5 },
        { code: 'BLR-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 1.5 },
        { code: 'BLR-B2', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 1.5 },
      ],
    },
  ];

  for (const pData of parkingsData) {
    const existing = await prisma.parking.findFirst({
      where: { name: pData.name },
    });

    if (!existing) {
      const parking = await prisma.parking.create({
        data: {
          name: pData.name,
          address: pData.address,
          city: pData.city,
          description: pData.description,
          latitude: pData.latitude,
          longitude: pData.longitude,
          imageUrl: pData.imageUrl,
          ownerId: pData.ownerId,
          slots: {
            create: pData.slots,
          },
        },
        include: { slots: true },
      });
      console.log(`✓ Created parking: ${parking.name} (${parking.slots.length} slots)`);

      // Seed a sample booking for Alex Commuter on the first parking's reserved slot
      if (pData.name === 'Metroplex Central Tower Parking') {
        const reservedSlot = parking.slots.find((s) => s.code === 'A-05');
        if (reservedSlot) {
          const now = new Date();
          const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          const qrToken = `PS-TK-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

          await prisma.booking.create({
            data: {
              userId: commuter.id,
              parkingId: parking.id,
              slotId: reservedSlot.id,
              startTime: now,
              endTime: later,
              amount: 24.0,
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              qrToken: qrToken,
            },
          });
          console.log(`  ✓ Sample booking attached to slot ${reservedSlot.code}`);
        }
      }
    }
  }

  // 4. Initial Audit Log Entry
  await prisma.auditLog.create({
    data: {
      actorId: masterAdmin.id,
      action: 'SYSTEM_SEED_INITIALIZED',
      target: 'SYSTEM',
      metadata: {
        note: 'Initial production system seed executed with default accounts and sample infrastructure.',
        environment: process.env.NODE_ENV || 'production',
      },
    },
  });

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
