const jwt  = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')
const db = require('../config/database')

function signAccess(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  )
}

function signRefresh(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )
}

function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
}

function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret')
}

async function generateTokens(user) {
  const accessToken  = signAccess(user)
  const refreshToken = signRefresh(user)

  // Store hashed refresh token
  const hash     = await bcrypt.hash(refreshToken, 8)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await db.query(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?,?,?,?)',
    [randomUUID(), user.id, hash, expiresAt]
  )

  return { accessToken, refreshToken }
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh, generateTokens }
