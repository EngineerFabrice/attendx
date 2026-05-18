require('dotenv').config()

// ── Production safety checks ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev_secret') {
    console.error('FATAL: JWT_SECRET must be set in production')
    process.exit(1)
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'dev_refresh_secret') {
    console.error('FATAL: JWT_REFRESH_SECRET must be set in production')
    process.exit(1)
  }
}

const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')

const { testConnection } = require('./src/config/database')
const { initSocket }     = require('./src/socket/socket.handler')
const { errorHandler }   = require('./src/middleware/errorHandler')
const { generalLimiter } = require('./src/middleware/rateLimiter')

const authRoutes     = require('./src/routes/auth.routes')
const adminRoutes    = require('./src/routes/admin.routes')
const lecturerRoutes = require('./src/routes/lecturer.routes')
const studentRoutes  = require('./src/routes/student.routes')

const app    = express()
const server = http.createServer(app)

// ── Allowed origins ───────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : allowedOrigins,
    methods: ['GET', 'POST'],
  },
})
initSocket(io)
app.set('io', io)   // make io accessible in controllers via req.app.get('io')

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? allowedOrigins
    : (process.env.CORS_ORIGIN || '*').split(','),
  credentials: true,
}))
app.use(express.json())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Apply general rate limiter to all routes
app.use(generalLimiter)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/lecturer', lecturerRoutes)
app.use('/api/student',  studentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` })
})

// Error handler (must be last)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000

async function start() {
  await testConnection()
  require('./src/services/fcm.service').init()
  
  // Listen on all network interfaces (not just localhost)
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n AttendX API running on:`)
    console.log(`   Local: http://localhost:${PORT}`)
    console.log(`   Network: http://${getLocalIpAddress()}:${PORT}`)
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

// Helper to get local IP address
function getLocalIpAddress() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

start().catch(err => { console.error(err); process.exit(1) })