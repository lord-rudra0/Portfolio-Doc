const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    match: [
      /^\+?[\d\s-]{10,}$/,
      'Please provide a valid phone number'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Please provide appointment date'],
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Please provide appointment time'],
    enum: {
      values: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
      message: 'Invalid appointment time'
    }
  },
  type: {
    type: String,
    required: [true, 'Please provide appointment type'],
    enum: {
      values: ['consultation', 'followup', 'cardiac', 'emergency'],
      message: 'Invalid appointment type'
    }
  },
  symptoms: {
    type: String,
    trim: true,
    maxlength: [500, 'Symptoms description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
appointmentSchema.index({ date: 1, time: 1 }, { unique: true });

// Pre-save middleware to check for conflicting appointments
appointmentSchema.pre('save', async function(next) {
  if (this.isModified('date') || this.isModified('time')) {
    const existingAppointment = await this.constructor.findOne({
      date: this.date,
      time: this.time,
      status: { $ne: 'cancelled' },
      _id: { $ne: this._id }
    });

    if (existingAppointment) {
      throw new Error('This time slot is already booked');
    }
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
