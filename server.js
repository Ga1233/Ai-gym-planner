require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const authRoutes    = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const aiRoutes      = require('./routes/ai');
const userRoutes    = require('./routes/users');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security ──────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      scriptSrc:     ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc:      ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc:       ["'self'", "https://fonts.gstatic.com"],
      imgSrc:        ["'self'", "data:", "https:"],
      connectSrc:    ["'self'"],
    },
  },
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ── Rate Limiting ─────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const aiLimiter   = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: 'Too many AI requests. Please wait.' } });

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Static Files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/ai',       aiLimiter,   aiRoutes);
app.use('/api/users',    userRoutes);
app.get('/api/health',   (_, res) => res.json({ status: 'ok' }));

// ── SPA Fallback ──────────────────────────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  ForgeFit running → http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌  Startup failed:', err.message);
    process.exit(1);
  }
})();
