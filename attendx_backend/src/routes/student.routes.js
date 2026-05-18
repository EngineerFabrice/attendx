const router = require('express').Router()
const { body } = require('express-validator')
const ctrl   = require('../controllers/student.controller')
const { authenticate, requireRole } = require('../middleware/auth')

router.use(authenticate, requireRole('student', 'admin'))

router.get ('/dashboard',                 ctrl.getDashboard)
router.get('/check-in', ctrl.checkInValidation, ctrl.checkIn)
router.get ('/courses',                   ctrl.getCourses)
router.get ('/sessions/active',           ctrl.getActiveSessions)
router.post('/checkin',
  body('sessionId').notEmpty(),
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  ctrl.checkIn
)
router.get ('/history',                   ctrl.getHistory)
router.get ('/analytics',                 ctrl.getAnalytics)
router.get ('/notification-preferences',  ctrl.getNotifPrefs)
router.put ('/notification-preferences',  ctrl.updateNotifPrefs)
router.post('/device-token',              ctrl.registerDeviceToken)

module.exports = router
