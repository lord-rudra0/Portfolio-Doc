const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/', appointmentController.createAppointment);
router.get('/available-slots', appointmentController.getAvailableSlots);

module.exports = router;
