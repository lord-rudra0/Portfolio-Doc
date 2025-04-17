const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/', appointmentController.createAppointment);
router.get('/available-slots', appointmentController.getAvailableSlots);
router.get('/', appointmentController.getAllAppointments);

module.exports = router;
