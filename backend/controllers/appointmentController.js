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
    console.log('Received appointment data:', req.body);

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'type'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        });
      }
    }

    // Create appointment
    const appointment = new Appointment({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      date: new Date(req.body.date),
      time: req.body.time,
      type: req.body.type,
      symptoms: req.body.symptoms || '',
      status: 'pending'
    });

    // Save appointment
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
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(400).json({
      message: error.message || 'Error creating appointment'
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
