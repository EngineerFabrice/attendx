const { error } = require('../utils/response')

function errorHandler(err, req, res, next) {
  console.error(err)

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json(error('A record with that value already exists'))
  }

  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'
  res.status(status).json(error(message))
}

module.exports = { errorHandler }
