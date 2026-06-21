const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:3000', 'https://docappoint.vercel.app', 'https://docappointbd.vercel.app'],
    credentials: true,
}));
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const uri = "mongodb://docappoint:K07f7Kwz2nVzpdTj@ac-ppqx0gr-shard-00-00.9iyx4gw.mongodb.net:27017,ac-ppqx0gr-shard-00-01.9iyx4gw.mongodb.net:27017,ac-ppqx0gr-shard-00-02.9iyx4gw.mongodb.net:27017/docappoint?ssl=true&replicaSet=atlas-mxi3f3-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4
})
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.log("Connection Error:", err.message));

// ─── Schemas & Models ─────────────────────────────────────────────────────────

// Doctor Schema (Dynamic)
const Doctor = mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }));

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    doctorName: { type: String, required: true },
    patientName: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    doctorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send({ message: 'DocAppoint Server is running!' });
});

// ─── Doctor Routes ──────────────────────────────────────────────────────────────

// GET /doctors — Get all doctors
app.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.send(doctors);
    } catch (error) {
        res.status(500).send(error);
    }
});

// ─── Appointment Routes ───────────────────────────────────────────────────────

// POST /appointments — Create a new appointment
app.post('/appointments', async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        const result = await appointment.save();
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /appointments?email=user@gmail.com — Get appointments for a specific user
app.get('/appointments', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email query parameter is required' });
        }
        const appointments = await Appointment.find({ userEmail: email }).sort({ createdAt: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /appointments/:id — Update an appointment
app.patch('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /appointments/:id — Delete an appointment
app.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Appointment.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Review Routes ────────────────────────────────────────────────────────────

// POST /reviews — Submit a review
app.post('/reviews', async (req, res) => {
    try {
        const { userEmail, doctorName } = req.body;
        // Prevent duplicate reviews for same doctor
        const existing = await Review.findOne({ userEmail, doctorName });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this doctor.' });
        }
        const review = new Review(req.body);
        const result = await review.save();
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /reviews?email=user@gmail.com — Get reviews for a specific user
app.get('/reviews', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email query parameter is required' });
        }
        const reviews = await Review.find({ userEmail: email }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /reviews/doctor?name=Dr.%20Ayesha — Get all reviews for a specific doctor
app.get('/reviews/doctor', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Doctor name query parameter is required' });
        }
        const reviews = await Review.find({ doctorName: name }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(` Server is running on port ${port}`);
    });
}

module.exports = app;