const Appointment = require('../models/Appointment');
const nodemailer = require('nodemailer');
const moment = require('moment');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.createAppointment = async (req, res) => {
  try {
    console.log('Received appointment data:', req.body); // Debug log

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate date is not in the past
    const appointmentDate = new Date(req.body.date);
    if (appointmentDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        message: 'Appointment date cannot be in the past'
      });
    }

    // Validate time format and availability
    const validTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    if (!validTimes.includes(req.body.time)) {
      return res.status(400).json({
        message: 'Invalid appointment time'
      });
    }

    // Check for existing appointment at the same time
    const existingAppointment = await Appointment.findOne({
      date: appointmentDate,
      time: req.body.time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      date: appointmentDate,
      time: req.body.time,
      type: req.body.type,
      symptoms: req.body.symptoms || '',
      status: 'pending'
    });

    await appointment.save();

    // Send email to doctor
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Appointment Request',
      html: `
        <h2>New Appointment Request</h2>
        <p><strong>Patient:</strong> ${appointment.name}</p>
        <p><strong>Date:</strong> ${moment(appointment.date).format('MMMM Do YYYY')}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Type:</strong> ${appointment.type}</p>
        <p><strong>Phone:</strong> ${appointment.phone}</p>
        <p><strong>Email:</strong> ${appointment.email}</p>
        <p><strong>Symptoms:</strong> ${appointment.symptoms || 'None provided'}</p>
      `
    });

    // Send confirmation email to patient
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: 'Appointment Request Received',
      html: `
        <h2>Your Appointment Request has been Received</h2>
        <p>Dear ${appointment.name},</p>
        <p>We have received your appointment request for:</p>
        <p><strong>Date:</strong> ${moment(appointment.date).format('MMMM Do YYYY')}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p>We will confirm your appointment shortly.</p>
        <p>Best regards,<br>Dr. Priya Sharma's Office</p>
      `
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Server error:', error); // Debug log
    res.status(400).json({
      message: error.message || 'Error creating appointment',
      error: error.errors || {}
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const bookedAppointments = await Appointment.find({
      date: new Date(date),
      status: { $ne: 'cancelled' }
    }).select('time');

    const allSlots = [
      '09:00', '10:00', '11:00', '12:00',
      '14:00', '15:00', '16:00', '17:00'
    ];

    const bookedSlots = bookedAppointments.map(app => app.time);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
