const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    enum: {
      values: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
      message: 'Please select a valid appointment time'
    }
  },
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: {
      values: ['consultation', 'followup', 'cardiac', 'emergency'],
      message: 'Please select a valid appointment type'
    }
  },
  symptoms: {
    type: String,
    trim: true,
    default: ''
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
