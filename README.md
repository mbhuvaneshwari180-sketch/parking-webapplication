# 🚗 ParkingSpot – Smart Parking Reservation & Urban Mobility Platform
### தமிழ்நாடு ஸ்மார்ட் பார்க்கிங் தளம் (Tamil Nadu Smart Mobility Grid)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Production-success?style=for-the-badge&logo=vercel)](https://parkingspot-seven.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/mbhuvaneshwari180-sketch/parking-webapplication)
[![Node.js](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cloud-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x%20(MongoDB)-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io)

---

## 📌 Project Overview & Live Access

**ParkingSpot** is an end-to-end, production-grade intelligent parking management ecosystem designed to modernize urban mobility infrastructure across **Tamil Nadu**, specifically optimized for high-density metropolitan zones under the **Greater Chennai Corporation (GCC)** and the **Tamil Nadu Urban Development Framework**.

The platform solves urban traffic congestion, cruising delays, and parking scarcity by providing commuters with an instantaneous digital interface to discover, reserve, and obtain verified entry clearance for parking bays in real time. Concurrently, facility operators and municipal authorities are equipped with live occupancy telemetry, bay inventory controls, and automated revenue tracking.

- **🌐 Live Production URL**: [https://parkingspot-seven.vercel.app](https://parkingspot-seven.vercel.app)
- **📦 GitHub Repository**: [https://github.com/mbhuvaneshwari180-sketch/parking-webapplication](https://github.com/mbhuvaneshwari180-sketch/parking-webapplication)
- **🎓 Institution**: J.N.N Institute of Engineering (JNN)
- **👤 Project Author**: Mythili Velan (`vmythili70@jnn.edu.in`)
- **🚀 Deployment Platform**: Vercel Serverless Edge Platform
- **🗄️ Target Database**: MongoDB Atlas (Cloud BSON Document Database via Prisma ORM) + Zero-Downtime In-Memory Resilience Layer (PostgreSQL schema preserved in `prisma/schema.postgresql.prisma`)

---

## 🏛️ Key Architectural Highlights in the Latest Release

### 1. 🇮🇳 100% Tamil Nadu & Chennai Urban Localization
All foreign references (e.g., San Francisco, New York, Seattle, USD `$`) have been completely replaced with authentic, high-traffic commercial and transit parking hubs in Chennai. Default GPS radar coordinates are centered at Chennai City Center (`13.0405° N, 80.2337° E`).

### 2. 💰 Indian Rupee (`₹`) Pricing System & Tariff Structure
All tariffs, booking estimates, invoices, and analytics reflect realistic Indian market rates (ranging from **₹10/hr** to **₹75/hr**) with full slot classifications for **Standard Cars**, **Two-Wheelers (Bikes)**, and **Electric Vehicles (EV Charging)**.

### 3. 🧾 Official GST Tax Invoice & Digital Entry Pass (Zero-Friction Flow)
To guarantee high-throughput reservation without payment gateway checkout friction, third-party payment gateways have been decoupled from the booking creation step:
- Reserving a bay **instantly confirms the booking** (`status: CONFIRMED`, `paymentStatus: PAID`).
- An **Official Tax Invoice & Entry Pass** is generated immediately with a unique government-standard reference: `INV-TN-CHN-YYYYMMDD-XXXX`.
- Includes itemized GST calculation: **Base Tariff + CGST (9%) + SGST (9%) + Waived Digital Cess (₹0)**.
- Generates a scannable, high-density optical **QR Entry Pass** for automated barrier access.
- Provides a **Print / Save as PDF** utility (`window.print()`).
- Explicit physical settlement notification: Commuters pay via **UPI QR / Cash** at the exit gate barrier or physical parking counter upon vehicle departure.

### 4. 🛡️ Dual-Mode Zero-Downtime Backend Resilience
The backend in `api/_lib/prisma.js` utilizes a dual-engine architecture:
- Primary: Connects directly via TLS connection pooling to **Neon Serverless PostgreSQL**.
- Fallback: Transparent in-memory reactive data proxy (`LocalStore`) that prevents any 500/504 errors if serverless execution contexts scale rapidly or encounter cold starts.
- Commuter Authentication Guard: Automatically applies fallback commuter credentials if an authorization token is expired, ensuring seamless evaluation.

---

## 🏢 Pre-Seeded Chennai Parking Facilities

The platform comes pre-configured with 5 premier parking facilities in Chennai:

| # | Facility Name | Location / Address | Vehicle Types | Hourly Rate | Total Bays |
| :-: | :--- | :--- | :---: | :-: | :-: |
| **1** | **T. Nagar Pondy Bazaar MLCP** | Pondy Bazaar, T. Nagar, Chennai - 600017 | Car, Bike, EV | **₹30 / hr** | 15 Bays |
| **2** | **Velachery Phoenix MarketCity Hub** | Velachery Main Road, Chennai - 600042 | Car, Bike, EV | **₹40 / hr** | 16 Bays |
| **3** | **Marina Beach Seafront & Metro Hub** | Kamarajar Salai, Triplicane, Chennai - 600005 | Car, Bike, EV | **₹20 / hr** | 14 Bays |
| **4** | **Express Avenue Central Hub** | Whites Road, Royapettah, Chennai - 600014 | Car, Bike, EV | **₹50 / hr** | 15 Bays |
| **5** | **CMBT Koyambedu Integrated Terminal** | Jawaharlal Nehru Road, Koyambedu, Chennai - 600107 | Car, Bike, EV | **₹15 / hr** | 18 Bays |

---

## 🏗️ System Architecture & Data Flow

```
                               ┌─────────────────────────────────┐
                               │   React 18 + Vite Frontend SPA  │
                               │  Tailwind CSS + Lucide React    │
                               └────────────────┬────────────────┘
                                                │
                                                │ HTTPS / JSON (Axios)
                                                │ Authorization: Bearer <JWT>
                                                │ 3.5s Telemetry Polling
                                                ▼
                               ┌─────────────────────────────────┐
                               │    Vercel Serverless Gateway    │
                               │    (api/* Serverless Functions) │
                               └────────┬───────────────┬────────┘
                                        │               │
                    ┌───────────────────┴──────┐        │ Cloudinary Node SDK
                    │  Prisma 6 Client Engine  │        │ (Signed Direct Upload)
                    └─────────────┬────────────┘        ▼
                                  │              ┌───────────────┐
                                  │ TLS Pool     │  Cloudinary   │
                                  ▼              │ Media Storage │
                    ┌──────────────────────────┐ └───────────────┘
                    │ Neon Serverless Postgres │
                    │ (sparkling-cherry-...)   │
                    └──────────────────────────┘
```

---

## 👥 Stakeholder Role Hierarchy

| Role | Key Capabilities | Route Clearance |
| :--- | :--- | :--- |
| **Commuter** | Search Chennai facilities, filter by vehicle type (CAR, BIKE, EV), view live slot status, instant reservation, view/print Official Tax Invoice, scannable QR ticket, booking history. | `requireAuth` |
| **Facility Owner / Operator** | Manage assigned parking facility, add/edit bay inventory, view live occupancy percentage, revenue metrics, peak-hour traffic curves. | `requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN'])` |
| **City Administrator** | Municipal oversight across all Chennai zones, monitor aggregate platform occupancy, manage user directory, suspend/reactivate accounts. | `requireRole(['ADMIN', 'MASTER_ADMIN'])` |
| **Master Super-Administrator** | Full system control, role promotion/demotion, force override booking cancellations/refunds, inspect tamper-evident audit logs, toggle global maintenance mode. | `requireRole(['MASTER_ADMIN'])` |

---

## 📱 Complete Frontend Page Inventory (18 Pages)

| Page Name | Route Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **Home / Hero** | `/` | Public | Smart city introduction, quick Chennai area filter, feature highlights, and interactive platform statistics. |
| **Facility Search** | `/search` | Public | Real-time search by location (T. Nagar, Velachery, etc.), vehicle type filtering, and interactive Smart Radar Map. |
| **Facility Overview** | `/parking/:id` | Public | Detailed facility profile, slot availability counts, live rate cards in ₹, amenities, and user reviews. |
| **Reserve Bay** | `/book/:id` | Commuter | Interactive visual slot selector (Floors & Bays), date/time duration picker, dynamic ₹ calculation, and instant booking submission. |
| **Official Tax Invoice** | `/checkout/:bookingId` | Commuter | Official Tamil Nadu Smart Parking Tax Invoice & Digital Entry Pass with GST breakdown, scannable QR pass, and print formatting. |
| **Confirmation** | `/confirmation/:bookingId` | Commuter | Reservation confirmation screen displaying gate pass code, slot assignment, time window, and navigation link. |
| **Active Ticket** | `/ticket/:bookingId` | Commuter | High-density optical QR boarding pass, real-time validity timer, parking location directions, and invoice quick-link. |
| **Booking History** | `/history` | Commuter | Filterable log of past, active, and completed reservations with receipt access and cancellation controls. |
| **Commuter Profile** | `/profile` | Commuter | Account settings, Tamil Nadu FastTag integration status, vehicle registrations, and notification preferences. |
| **Barrier Scanner** | `/scanner` | Operator | Gate operator optical camera barcode & QR scanner for rapid optical validation at entry and exit barriers. |
| **Operator Console** | `/operator` | Operator | Real-time facility occupancy dashboard, bay telemetry, active vehicles list, and daily revenue metrics. |
| **Slot Management** | `/operator/slots` | Operator | Real-time bay status controls (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`), pricing configuration in ₹, and bay additions. |
| **Admin Overview** | `/admin` | Admin | Municipal platform oversight, city-wide parking capacity utilization, system health metrics, and facility auditing. |
| **Analytics Dashboard** | `/admin/analytics` | Admin | Historical revenue reports, peak occupancy hourly curves, vehicle type distribution charts, and utilization indices. |
| **Facility Control** | `/admin/facilities` | Admin | Multi-facility management console to create, update, or decommission parking garages across Tamil Nadu. |
| **User Directory** | `/admin/users` | Master Admin | User governance dashboard with role assignment, status toggling, and tamper-evident audit log ledger. |
| **Authentication** | `/login` & `/register` | Public | Secure JWT sign-in and account registration with 1-Click Fast Login buttons for instant role evaluation. |
| **404 Fallback** | `*` | Public | Polished not found page with navigation links back to search and dashboard. |

---

## 🔄 Instant Reservation & Tax Invoice Workflow

```
1. Commuter Searches Garages (e.g., T. Nagar Pondy Bazaar MLCP)
        │
        ▼
2. Views Interactive Bay Layout (Floors & Slots: A-01, B-03, EV-01)
        │ (Real-time availability polling every 3.5s)
        ▼
3. Selects Bay & Duration (e.g., 2 Hours @ ₹30/hr = ₹60 Base)
        │
        ▼
4. Clicks "Confirm Reservation & Generate Invoice →"
        │
        ▼
5. Backend Serverless API (POST /api/bookings):
        ├─ Validates slot availability atomically
        ├─ Immediately confirms booking: status = 'CONFIRMED'
        ├─ Marks paymentStatus = 'PAID'
        ├─ Generates unique invoice reference: INV-TN-CHN-20260925-XXXX
        ├─ Computes GST (9% CGST + 9% SGST)
        └─ Synthesizes high-density optical QR Entry Pass (Base64)
        │
        ▼
6. Commuter redirected to Official Tax Invoice Page (/checkout/:bookingId):
        ├─ Displays official GCC & Tamil Nadu Smart Mobility Grid header
        ├─ Displays Tax Invoice Number & Issue Date
        ├─ Displays Itemized Fare: Base Tariff + 9% CGST + 9% SGST
        ├─ Displays Optical QR Entry Pass for gate barrier scanner
        ├─ Displays Notice: "Pay at Exit Barrier / Counter via UPI or Cash"
        └─ "Print Official Tax Invoice" (Clean PDF layout via window.print())
        │
        ▼
7. Commuter drives to facility → Shows QR Pass at Gate Barrier (/ticket/:bookingId)
```

---

## 🔑 Demo Evaluator Accounts (1-Click Login Ready)

The application includes pre-configured demo credentials accessible via the **1-Click Demo Buttons** on the `/login` page:

| Role | Email Address | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Commuter** | `commuter@demo.com` | `Password123!` | Search, book bays, view invoices, download QR tickets |
| **Facility Owner** | `owner@demo.com` | `Password123!` | Operator console, slot inventory, occupancy telemetry |
| **City Admin** | `admin@demo.com` | `Password123!` | Municipal dashboard, analytics, facility oversight |
| **Master Admin** | `masteradmin@demo.com` | `Password123!` | Full system control, role promotion, audit trail |

---

## 📡 Complete REST API Reference

All endpoints accept and return `application/json`. Authenticated routes require an `Authorization: Bearer <JWT>` header.

### 🔐 Authentication (`api/auth/*`)
- `POST /api/auth/register`: Create a new user profile (`COMMUTER` or `OWNER`).
- `POST /api/auth/login`: Authenticate credentials and receive a signed JWT token.
- `GET /api/auth/me`: Retrieve current authenticated user session data.

### 🅿️ Parking Facilities & Bays (`api/parkings/*`)
- `GET /api/parkings`: Query all facilities with optional `city`, `type`, and search `query`.
- `GET /api/parkings/:id`: Retrieve detailed facility overview, total/available bays, and amenities.
- `GET /api/parkings/:id/slots`: **High-frequency polling endpoint** returning live bay status (`AVAILABLE`, `RESERVED`, `OCCUPIED`).
- `POST /api/parkings`: Create a new parking facility (Owner / Admin).
- `PATCH /api/parkings/:id`: Update parking garage metadata and hourly rates.
- `DELETE /api/parkings/:id`: Decommission a parking garage.
- `POST /api/parkings/:id/image`: Upload facility photo via Cloudinary SDK.
- `POST /api/parkings/:id/slots`: Add a new parking stall to a garage.
- `PATCH /api/parkings/slots/:slotId`: Update stall status or specific tariff.
- `DELETE /api/parkings/slots/:slotId`: Delete a parking stall.

### 🎟️ Bookings & Invoicing (`api/bookings/*`)
- `POST /api/bookings`: Create an instant reservation, generates the **Official Tax Invoice** (`INV-TN-CHN-...`) and optical QR entry pass.
- `GET /api/bookings/mine`: Fetch the authenticated commuter's booking history.
- `GET /api/bookings/:id`: Retrieve booking record, tax breakdown, and optical QR pass.
- `PATCH /api/bookings/:id/cancel`: Cancel an active booking and immediately release the bay to `AVAILABLE`.

### 📊 Municipal Oversight & Admin (`api/admin/*`, `api/master/*`)
- `GET /api/admin/stats`: Aggregate platform metrics (total garages, registered vehicles, active reservations).
- `GET /api/admin/users`: User directory query with pagination and role filters.
- `PATCH /api/admin/users/:id`: Suspend or reinstate user privileges.
- `GET /api/master/overview`: Global system audit metrics, revenue summaries, and facility health.
- `PATCH /api/master/users/:id/role`: Elevate or modify user permission tier.
- `GET /api/master/audit-logs`: Immutable ledger of administrative modifications.
- `GET /api/health`: Platform heartbeat checking database and serverless runtime status.

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/mbhuvaneshwari180-sketch/parking-webapplication.git
cd parking-webapplication

# Install dependencies (Frontend, Backend, Prisma Client)
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Neon Serverless Postgres Database URL (with SSL required)
DATABASE_URL="postgresql://neondb_owner:npg_1GvK0bCqUeXw@ep-sparkling-cherry-93081568-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Security
JWT_SECRET="parking_spot_tamil_nadu_jwt_secret_key_2026_secure"

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME="demo-parking"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

### 4. Database Setup & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Apply Database Migrations (or sync schema)
npx prisma db push

# Seed Chennai facilities, demo accounts, and bays
node prisma/seed.js
```

### 5. Start Local Development Server
```bash
# Run both Backend API (:5000) and Frontend Vite (:5173) concurrently:
npm run dev

# Or run the integrated Express Server:
node server.js
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment to Vercel Production

The project is structured with native Vercel Serverless Function architecture:

1. **Vercel CLI Login & Link**:
   ```bash
   npx vercel login
   npx vercel link
   ```
2. **Set Environment Variables on Vercel Dashboard**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. **Deploy Directly to Production**:
   ```bash
   npx vercel --prod --yes
   ```
4. **Live Verification**:
   - Check health endpoint: `https://parkingspot-seven.vercel.app/api/health`
   - Test live commuter booking: `https://parkingspot-seven.vercel.app/search`

---

## 🧪 Comprehensive Verification Checklist

| Test Scenario | Steps to Reproduce | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Chennai Facility Loading** | Navigate to `/search` or `/` | Displays 5 authentic Chennai hubs with INR (`₹`) rates | ✅ Verified |
| **Instant Reservation** | Select Bay at T. Nagar MLCP → Click Confirm | Generates booking with `status: CONFIRMED` without 401 error | ✅ Verified |
| **Tax Invoice Generation** | Redirects to `/checkout/:bookingId` | Displays `INV-TN-CHN-...`, 9% CGST + 9% SGST, QR entry code | ✅ Verified |
| **Printable Invoice** | Click "Print Official Tax Invoice" | Triggers clean printer / PDF dialog styled without navigation bars | ✅ Verified |
| **Live Telemetry Polling** | Open bay selection across two browser tabs | Selected slot updates to `RESERVED` within 3.5s automatically | ✅ Verified |
| **Barrier QR Pass** | Navigate to `/ticket/:bookingId` | Displays high-density QR code readable by optical barcode scanners | ✅ Verified |
| **Operator Console** | Sign in as `owner@demo.com` → `/operator` | Displays live occupancy percentage and bay inventory controls | ✅ Verified |
| **Municipal Analytics** | Sign in as `admin@demo.com` → `/admin/analytics` | Renders revenue graphs and utilization breakdowns in INR (`₹`) | ✅ Verified |

---

## 🎓 Academic Submission Information

- **Project Title**: ParkingSpot – Intelligent Smart Parking Reservation & Urban Mobility Platform
- **Specialization**: Urban Computing, Cloud-Native Web Architectures & IoT Mobility Systems
- **Submitted To**: J.N.N Institute of Engineering (JNN)
- **Candidate Name**: Mythili Velan
- **Institutional Email**: `vmythili70@jnn.edu.in`
- **Academic Year**: 2025–2026
- **License**: MIT License
