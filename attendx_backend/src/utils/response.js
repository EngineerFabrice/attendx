const success = (data, meta) => ({ success: true, data, ...(meta ? { meta } : {}) })
const error   = (message, code) => ({ success: false, error: message, ...(code ? { code } : {}) })

module.exports = { success, error }
