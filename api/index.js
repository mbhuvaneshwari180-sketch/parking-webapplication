import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './auth/routes.js';
import parkingsRouter from './parkings/routes.js';
import bookingsRouter from './bookings/routes.js';
import analyticsRouter from './analytics/routes.js';
import adminRouter from './admin/routes.js';
import masterRouter from './master/routes.js';
import prisma from './_lib/prisma.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Global Maintenance Mode check
app.use(async (req, res, next) => {
  try {
    // Skip maintenance check for auth login/me and master admin routes
    if (
      req.path.startsWith('/api/master') ||
      req.path.startsWith('/api/auth/login') ||
      req.path.startsWith('/api/auth/me') ||
      req.path === '/api/health'
    ) {
      return next();
    }

    const config = await prisma.systemSetting.findUnique({
      where: { key: 'global_config' },
    });

    if (config && config.value && config.value.maintenanceMode === true) {
      return res.status(503).json({
        success: false,
        error: 'System is currently undergoing scheduled maintenance. Please try again shortly.',
        maintenance: true,
      });
    }

    next();
  } catch (err) {
    // If database is booting up or table not ready, don't crash
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ParkingSpot Serverless API',
  });
});

// Mount modular sub-routers
app.use('/api/auth', authRouter);
app.use('/api/parkings', parkingsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/master', masterRouter);

// Fallback 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  return res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error occurred',
  });
});

export default app;
