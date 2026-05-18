const { verifyAccess } = require('../utils/jwt')
const { error } = require('../utils/response')

function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json(error('Authentication required'))
  }
  try {
    req.user = verifyAccess(header.slice(7))
    next()
  } catch {
    res.status(401).json(error('Invalid or expired token'))
  }
}

function requireRole(...roles) {
  const allowed = roles.flat()
  return (req, res, next) => {
    if (!allowed.includes(req.user?.role)) {
      return res.status(403).json(error('Insufficient permissions'))
    }
    next()
  }
}

module.exports = { authenticate, requireRole }
