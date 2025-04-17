require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const appointmentRoutes = require('./routes/appointmentRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
app.use(cors({
    origin: [
        'https://rudra-ps-portfolio-doc.vercel.app',
        'http://127.0.0.1:8080',
        'http://localhost:8080'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Export the app for Vercel serverless deployment
module.exports = app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
