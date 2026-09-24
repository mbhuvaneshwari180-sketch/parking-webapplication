# ParkingSpot – Smart Parking Reservation & Urban Mobility Platform

ParkingSpot is a complete, production-grade intelligent parking management ecosystem designed to modernize urban mobility infrastructure. It resolves urban vehicle congestion and parking scarcity by providing commuters with an intuitive, unified interface to discover, reserve, and pay for parking in real time, while empowering parking facility operators and city administrators with powerful tools for inventory, occupancy telemetry, and automated revenue optimization.

---

## 🌟 Executive Summary & Core Value Proposition

In rapidly expanding urban environments, up to 30% of downtown traffic congestion is caused by drivers cruising in search of available parking bays. Traditional parking garages rely on manual ticketing, analog payment booths, and disjointed software systems, creating severe bottlenecks, fuel wastage, and revenue leakages.

ParkingSpot addresses this through:
1. **Real-Time Bay Availability**: Sub-4-second automated telemetry polling updates slot statuses dynamically for all users without manual browser refreshing.
2. **Double-Booking Elimination**: Interactive Prisma database transactions atomically lock stalls upon reservation, guaranteeing that two drivers cannot book the same spot simultaneously.
3. **Frictionless Digital Clearance**: High-density 2D QR passes paired with cryptographically secure, high-entropy tokens enable optical barrier access in seconds.
4. **Multi-Tenant Role Architecture**: Tailored, isolated workflows for **Commuters**, **Facility Owners**, **City Administrators**, and an exclusive **Master Super-Administrator**.
5. **Serverless-First Deployment**: Built natively for Vercel Serverless Functions and Neon Serverless Postgres, eliminating idle server costs while delivering near-instant scalability.

---

## 🏗️ System Architecture & Data Flow

```
                                  ┌─────────────────────────────┐
                                  │   React 19 + Vite Frontend  │
                                  │  Tailwind CSS + Lucide Icons│
                                  └──────────────┬──────────────┘
                                                 │
                                                 │ HTTP / JSON (Axios + JWT)
                                                 │ 3.5s Live Polling Loop
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   Vercel Serverless Gateway │
                                  │   (api/index.js - Express)  │
                                  └──────┬───────────────┬──────┘
                                         │               │
                     ┌───────────────────┴──────┐        │ Cloudinary Node SDK
                     │ Prisma ORM Client Layer  │        │ (Signed / Direct Upload)
                     └─────────────┬────────────┘        ▼
                                   │              ┌───────────────┐
                                   │ TLS Pool     │  Cloudinary   │
                                   ▼              │ Asset Storage │
                     ┌──────────────────────────┐ └───────────────┘
                     │ Neon Serverless Postgres │
                     │  (sparkling-cherry-...)  │
                     └──────────────────────────┘
```

---

## 👥 Stakeholder Role Hierarchy

| Role | Key Capabilities | Route Guards |
| :--- | :--- | :--- |
| **Commuter** | Search city garages, filter by vehicle (CAR/BIKE/EV), live slot selection, book & pay, digital QR pass, booking history & cancellations. | `requireAuth` |
| **Owner** | Facility operations dashboard, Cloudinary photo uploads, bay inventory management, occupancy %, revenue & peak-hour analytics. | `requireRole(['OWNER', 'ADMIN', 'MASTER_ADMIN'])` |
| **Admin** | Municipal operations oversight, view all garages and platform users, enforce account suspensions. | `requireRole(['ADMIN', 'MASTER_ADMIN'])` |
| **Master Admin** | Super-admin console, full CRUD, role promotion/demotion, account hard deletion, manual booking overrides (force refund/cancel), global maintenance switch, immutable audit logs. | `requireRole(['MASTER_ADMIN'])` |

---

## ⚙️ Tech Stack Breakdown

### Frontend
- **Framework**: React 19 + Vite 6
- **Routing**: React Router 7 (`BrowserRouter`)
- **Styling**: Tailwind CSS 3 with custom smart-city theme and custom status badges
- **Icons**: Lucide React
- **HTTP Client**: Axios with automatic JWT Bearer token request interceptor and 401 response invalidation
- **Polling**: Custom React hook `usePolling` with automatic tab visibility detection (`document.hidden`) to pause polling in the background and resume instantly when focused

### Backend
- **Runtime**: Node.js on Vercel Serverless Functions
- **Server Framework**: Express 4 mounted via `/api` serverless entrypoint
- **Database & ORM**: Neon Serverless Postgres + Prisma 6 ORM
- **Authentication**: Stateless JSON Web Tokens (JWT) signed with HMAC SHA-256 + bcrypt password hashing (10 salt rounds)
- **Image Storage**: Cloudinary Node SDK (v2) with signed signatures and direct server-side upload
- **QR Codes**: `qrcode` library generating server-side Base64 Data URLs
- **Payment Abstraction**: Multi-gateway driver architecture (Mock Gateway for instant testing, Razorpay and Stripe ready)
- **Validation**: Zod schema validation on all incoming API request payloads

---

## 🔄 End-to-End Booking Lifecycle

```
Commuter Searches Garages
       │
       ▼
Views Facility Details & Real-Time Slot Grid
       │ (Live telemetry refreshed every 3.5s)
       ▼
Selects Open Bay (e.g. A-01, EV Bay)
       │
       ▼
Picks Start & End Time (Dynamic Price Calculation)
       │
       ▼
POST /api/bookings (Prisma Interactive Transaction)
       ├─ Verifies bay status is AVAILABLE
       ├─ Detects overlapping time windows
       ├─ Atomically updates bay to RESERVED
       ├─ Generates cryptographically secure token: PS-TK-XXXXXXXX
       └─ Issues Booking Record (Status: PENDING, Payment: UNPAID)
       │
       ▼
POST /api/bookings/:id/pay
       ├─ Verifies payment provider (Mock / Razorpay / Stripe)
       ├─ Transactionally confirms booking (Status: CONFIRMED, Payment: PAID)
       └─ Generates High-Density QR Data URL
       │
       ▼
Commuter receives scannable Digital Pass (/ticket/:id)
       │
       ▼
Optional: Cancellation via PATCH /api/bookings/:id/cancel
       ├─ Booking marked CANCELLED
       ├─ Payment updated to REFUNDED
       └─ Bay atomically restored to AVAILABLE
```

---

## 👑 Master Admin & Tamper-Evident Audit Logging

The **Master Admin** represents the apex administrative authority.

1. **Non Self-Serve Privilege**: Cannot be self-selected during registration. Seeded once via `prisma/seed.js` or granted by an existing Master Admin.
2. **Dedicated Route Protection**: Every `/api/master/*` route is gated by `requireRole(['MASTER_ADMIN'])`.
3. **Manual Overrides**:
   - `FORCE_REFUND`: Immediately marks booking as refunded and restores the bay to available.
   - `FORCE_CANCEL`: Frees up a contested slot.
   - `FORCE_CONFIRM`: Manually settles a cash or offline payment.
4. **Audit Trail**: Every administrative action automatically creates a row in the `AuditLog` table containing:
   - `actorId`: Foreign key to the administrator.
   - `action`: Specific action tag (e.g., `ROLE_CHANGED`, `BOOKING_OVERRIDE_FORCE_REFUND`, `USER_STATUS_OVERRIDE`).
   - `target`: Unique identifier of the modified entity (e.g., `USER:clx...`, `BOOKING:clx...`).
   - `metadata`: JSON payload containing diffs, previous status, updated status, and administrative reason notes.
   - `createdAt`: UTC timestamp.

---

## 💳 Payment Abstraction Layer

Payments are handled by an extensible gateway factory in `api/_lib/payment/index.js`.
- **MOCK (Default)**: Generates deterministic test order sessions and simulates instant verification without external network latency.
- **RAZORPAY**: Pre-configured for Razorpay Orders API and HMAC SHA-256 server-side signature verification.
- **STRIPE**: Pre-configured for Stripe PaymentIntents API.
- **Security Guarantee**: Payment secret keys (`RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY`) **never leave the backend serverless runtime**.

---

## 🖼️ Cloudinary Image Upload Flow

- Cloudinary assets are managed via `api/_lib/cloudinary.js`.
- **Upload Signatures**: The server provides an endpoint (`GET /api/parkings/upload-signature`) that produces cryptographic timestamped signatures.
- **Direct Server Upload**: The backend also provides `POST /api/parkings/:id/image` which takes image base64 data and uploads directly through the Node SDK, updating the parking's `imageUrl` in Postgres.
- `CLOUDINARY_API_SECRET` is strictly held on the server and is never exposed to client-side bundles.

---

## 🛰️ Google Maps Integration & Fallback Radar

- The application is pre-configured for the **Google Maps JavaScript API**.
- When `VITE_GOOGLE_MAPS_API_KEY` is supplied, `RadarMap.jsx` dynamically loads the Google Maps SDK and displays customized dark-mode vector maps with custom markers.
- If the API key is not yet configured, `RadarMap.jsx` renders an interactive **Smart-City Radar Screen** with GPS coordinate HUDs, radial pulses, and target pins, ensuring zero broken UI states out of the box.

---

## 🔑 Demo Login Credentials

Demo accounts are pre-seeded in the database via `prisma/seed.js`. You can either type these credentials into `/login` or click the **1-Click Demo Buttons** on the login page:

| Account Type | Email | Password | Role Clearance |
| :--- | :--- | :--- | :--- |
| **Commuter** | `commuter@demo.com` | `Password123!` | Commuter |
| **Parking Owner** | `owner@demo.com` | `Password123!` | Owner |
| **City Admin** | `admin@demo.com` | `Password123!` | Admin |
| **Master Admin** | `masteradmin@demo.com` | `Password123!` | Master Admin |

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd parkingspot

# Install all dependencies (frontend, backend, Prisma)
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the parameters in your `.env` file:
- `DATABASE_URL`: Your Neon Postgres connection string with `?sslmode=require`
- `JWT_SECRET`: Random 32+ character string
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `PORT`: `5000`

### 4. Database Migration & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations to Neon Postgres
npx prisma migrate deploy
# (or npx prisma db push for rapid prototyping)

# Seed demo users, parkings, and system configuration
node prisma/seed.js
```

### 5. Running the Application
```bash
# Start both Backend API (:5000) and Vite Frontend (:5173) concurrently:
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Neon Database Setup (CLI Workflow)

To connect directly to Neon serverless Postgres from your terminal:
```bash
# 1. Install Neon CLI and authenticate
npm i -g neon@latest
neon login

# 2. Add skills and MCP extensions
neon skills -y
neon mcp -y

# 3. Link project to sparkling-cherry branch
neon link --project-id sparkling-cherry-93081568 --branch production -y

# 4. Initialize neon config
neon config init

# 5. Deploy configuration
neon deploy

# 6. Copy the resulting connection string into DATABASE_URL in .env:
# DATABASE_URL=postgresql://<user>:<password>@ep-sparkling-cherry-93081568.us-east-2.aws.neon.tech/neondb?sslmode=require

# 7. Run migrations and seed
npx prisma migrate deploy
node prisma/seed.js
```

---

## 🚀 Vercel Deployment Instructions

Deploying ParkingSpot to Vercel requires zero complex orchestration because both the Vite single-page app and the Express serverless functions share the repository.

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```
2. **Authenticate with Vercel**:
   ```bash
   vercel login
   # Authenticate with mythilivelan202@gmail.com
   ```
3. **Link the Project**:
   ```bash
   vercel link
   ```
4. **Configure Environment Variables**:
   In your Vercel Dashboard (`Settings -> Environment Variables`), add the following for **Production** and **Preview**:
   - `DATABASE_URL` (Neon Postgres URI with `?sslmode=require`)
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `PAYMENT_PROVIDER` (`MOCK`, `RAZORPAY`, or `STRIPE`)
   - `VITE_GOOGLE_MAPS_API_KEY` (Optional)
5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```
6. **Verify Deployment**:
   - Access `https://your-deployment.vercel.app/api/health` to confirm serverless status.
   - Access `https://your-deployment.vercel.app` to test the full commuter reservation flow.

---

## 📡 API Reference Documentation (Postman-Compatible)

All endpoints accept and return `application/json`. Authenticated routes require an `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/auth/register`: Register commuter or owner account.
  ```json
  { "name": "Alex Rivera", "email": "alex@demo.com", "password": "Password123!", "role": "COMMUTER" }
  ```
- `POST /api/auth/login`: Authenticate and receive JWT.
  ```json
  { "email": "commuter@demo.com", "password": "Password123!" }
  ```
- `GET /api/auth/me`: Retrieve current session user payload.

### Parkings & Slots
- `GET /api/parkings`: Search facilities by `query`, `city`, `type`.
- `GET /api/parkings/:id`: Detailed facility overview with bay counts.
- `GET /api/parkings/:id/slots`: **Poll-friendly** live status of all bays with `Cache-Control: no-cache`.
- `POST /api/parkings`: Create facility (Owner / Admin).
- `PATCH /api/parkings/:id`: Update facility details.
- `DELETE /api/parkings/:id`: Delete facility.
- `POST /api/parkings/:id/image`: Upload facility photo via Cloudinary SDK.
- `POST /api/parkings/:id/slots`: Add slot bay to parking.
- `PATCH /api/parkings/slots/:slotId`: Update slot pricing or status (`AVAILABLE`, `MAINTENANCE`).
- `DELETE /api/parkings/slots/:slotId`: Delete slot bay.

### Bookings & Clearance
- `POST /api/bookings`: Atomically reserve a slot, marks slot `RESERVED`.
  ```json
  { "parkingId": "...", "slotId": "...", "startTime": "2026-09-24T18:00:00Z", "endTime": "2026-09-24T20:00:00Z" }
  ```
- `GET /api/bookings/mine`: Retrieve commuter's reservation history.
- `GET /api/bookings/:id`: Fetch booking details with Base64 QR code and token.
- `POST /api/bookings/:id/pay`: Settle invoice via mock or gateway provider.
- `PATCH /api/bookings/:id/cancel`: Cancel reservation, marks slot `AVAILABLE`, issues refund.

### Analytics & Municipal Management
- `GET /api/analytics/owner`: Fetch owner KPIs, daily revenue, and 24h peak-hour curves.
- `GET /api/admin/stats`: Municipal platform aggregate statistics.
- `GET /api/admin/users`: Query user directory with role and status filtering.
- `PATCH /api/admin/users/:id`: Suspend or reactivate user account.

### Master Admin (Super-Admin Exclusive)
- `GET /api/master/overview`: Global revenue, city demand heatmap, and fleet stats.
- `PATCH /api/master/users/:id/role`: Promote or demote user role.
- `PATCH /api/master/users/:id/status`: Suspend or reactivate account.
- `DELETE /api/master/users/:id`: Hard-delete account from database.
- `PATCH /api/master/bookings/:id/override`: Manual override (`FORCE_REFUND`, `FORCE_CANCEL`, `FORCE_CONFIRM`, `FORCE_COMPLETE`).
- `GET /api/master/audit-logs`: Query tamper-evident audit ledger.
- `GET /api/master/settings`: Read global maintenance and feature flags.
- `PATCH /api/master/settings`: Update maintenance mode and feature flags.

---

## 🧪 Verification & End-to-End Testing Guide

1. **Verify Double-Booking Protection**:
   - Open two private/incognito browser windows.
   - In window 1, sign in as `commuter@demo.com` and select Bay `A-01`.
   - In window 2, browse to the same parking terminal.
   - Complete booking in window 1.
   - Within 3.5 seconds, window 2 will visually turn Bay `A-01` amber/red without manual refreshing.
   - If window 2 attempts to submit a reservation on `A-01`, the atomic Prisma transaction rejects the duplicate request with HTTP 400.
2. **Verify Payment & QR Generation**:
   - Complete checkout with the Mock Gateway.
   - Confirm receipt of high-density QR code and alphanumeric token (`PS-TK-...`).
   - Click "Print Pass" on `/ticket/:id` to inspect printable boarding-pass layout.
3. **Verify Master Admin Manual Override**:
   - Sign in as `masteradmin@demo.com`.
   - Open `/master/dashboard`.
   - Paste a booking ID into the Manual Override Console and execute `FORCE_REFUND`.
   - Navigate to `/master/audit-logs` and verify the `BOOKING_OVERRIDE_FORCE_REFUND` entry with actor and diff metadata.

---

## 🔮 Future Roadmap & WebSocket Migration Strategy

While stateless HTTP polling (every 3.5s) is optimal for Vercel Serverless Functions and zero-maintenance serverless billing, large-scale deployments with tens of thousands of concurrent drivers can migrate to true push-based WebSockets:

1. **Standalone Microservice**: Deploy a lightweight Node.js + Socket.IO microservice on Render, Railway, or Fly.io.
2. **Webhook Dispatcher**: On every slot write (`POST /api/bookings`, `PATCH /api/bookings/:id/cancel`), the Vercel backend fires an authenticated HTTP webhook payload to the WebSocket service.
3. **Selective Room Broadcasting**: The WebSocket service immediately emits a `slot:status_changed` event to the specific parking room (`parking:${parkingId}`), updating connected client interfaces in under 50ms.
