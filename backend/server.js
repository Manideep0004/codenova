// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const logger = require('./utils/logger');
const { register, httpRequestDurationSeconds } = require('./utils/metrics');
const promClient = require('prom-client');

// Initialize default system metrics
promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = register.getSingleMetric('http_requests_total') || new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const languageRoutes = require('./routes/languages');
const adminRoutes = require('./routes/admin');

const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Prometheus Latency and Request Tracker Middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const routePath = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route: routePath,
      status: res.statusCode
    });

    if (httpRequestDurationSeconds) {
      httpRequestDurationSeconds.observe({
        method: req.method,
        route: routePath,
        status: res.statusCode
      }, durationInSeconds);
    }
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/admin', adminRoutes);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    logger.info(`CodeNova API Gateway running on port ${PORT}`);
    try {
      await sequelize.authenticate();
      logger.info('Database connected successfully.');
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
    }
  });
}

module.exports = app;
