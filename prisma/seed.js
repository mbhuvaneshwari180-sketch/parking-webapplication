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
      name: 'K. Anbarasan (Commuter)',
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
      name: 'Sundar Raman (Facility Partner)',
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
      name: 'K. Rajeshwaran (Chennai City Admin)',
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
      name: 'Dr. Mythili Velan (GCC Master Admin)',
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

  // 3. Seed Realistic Chennai, Tamil Nadu Parking Locations
  const parkingsData = [
    {
      name: 'T. Nagar Pondy Bazaar Smart MLCP',
      address: 'Panagal Park, Sir Thyagaraya Road, T. Nagar',
      city: 'Chennai',
      description: 'Greater Chennai Corporation (GCC) automated multi-level smart parking facility with 7 floors, automated car elevators, live sensor displays, and direct access to Pondy Bazaar Pedestrian Plaza.',
      latitude: 13.0405,
      longitude: 80.2337,
      imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'TN-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 40.0 },
        { code: 'TN-02', type: 'CAR', status: 'OCCUPIED', pricePerHour: 40.0 },
        { code: 'TN-03', type: 'CAR', status: 'AVAILABLE', pricePerHour: 40.0 },
        { code: 'TN-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 60.0 },
        { code: 'TN-E2', type: 'EV', status: 'RESERVED', pricePerHour: 60.0 },
        { code: 'TN-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 15.0 },
        { code: 'TN-B2', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 15.0 },
        { code: 'TN-04', type: 'CAR', status: 'MAINTENANCE', pricePerHour: 40.0 },
      ],
    },
    {
      name: 'Velachery Phoenix & Grand Smart Hub',
      address: '142 Velachery Main Road, Indira Gandhi Nagar, Velachery',
      city: 'Chennai',
      description: 'Modern smart parking terminal with automated ANPR cameras, covered basement levels, 24/7 CCTV surveillance, and dedicated EV charging bays.',
      latitude: 12.9915,
      longitude: 80.2170,
      imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'VLC-101', type: 'CAR', status: 'AVAILABLE', pricePerHour: 50.0 },
        { code: 'VLC-102', type: 'CAR', status: 'AVAILABLE', pricePerHour: 50.0 },
        { code: 'VLC-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 75.0 },
        { code: 'VLC-E2', type: 'EV', status: 'OCCUPIED', pricePerHour: 75.0 },
        { code: 'VLC-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 20.0 },
      ],
    },
    {
      name: 'Marina Beach & Light House Metro Hub',
      address: 'Kamarajar Promenade, Triplicane, Marina Beach',
      city: 'Chennai',
      description: 'High-capacity beachside smart parking facility equipped with dynamic LED guidance, solar shaded stalls, automated barrier gates, and pedestrian walkways.',
      latitude: 13.0499,
      longitude: 80.2824,
      imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'MRN-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 30.0 },
        { code: 'MRN-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 30.0 },
        { code: 'MRN-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 50.0 },
        { code: 'MRN-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 10.0 },
      ],
    },
    {
      name: 'Anna Salai Express Avenue Central Hub',
      address: 'Whites Road, Royapettah / Anna Salai (Near Thousand Lights Metro)',
      city: 'Chennai',
      description: 'Central Chennai prime parking zone with contactless RFID fast entry, multi-tier security, valet assistance, and round-the-clock power backup.',
      latitude: 13.0587,
      longitude: 80.2609,
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'ANS-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 45.0 },
        { code: 'ANS-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 45.0 },
        { code: 'ANS-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 65.0 },
        { code: 'ANS-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 15.0 },
      ],
    },
    {
      name: 'CMBT Koyambedu Integrated Transit Hub',
      address: 'Inner Ring Road, Koyambedu, Chennai - 600107',
      city: 'Chennai',
      description: 'Integrated multimodal transit parking facility catering to intercity travelers, metro commuters, and suburban bus passengers.',
      latitude: 13.0694,
      longitude: 80.1948,
      imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
      ownerId: owner.id,
      slots: [
        { code: 'CMB-01', type: 'CAR', status: 'AVAILABLE', pricePerHour: 35.0 },
        { code: 'CMB-02', type: 'CAR', status: 'AVAILABLE', pricePerHour: 35.0 },
        { code: 'CMB-E1', type: 'EV', status: 'AVAILABLE', pricePerHour: 55.0 },
        { code: 'CMB-B1', type: 'BIKE', status: 'AVAILABLE', pricePerHour: 10.0 },
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
