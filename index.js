const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: ['http://localhost:3000', 'https://docappoint.vercel.app', 'https://docappointbd.vercel.app'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
    const token = req.cookies['better-auth.session_token'] ||
        req.cookies['__Secure-better-auth.session_token'];

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.split(' ')[1];

    const finalToken = token || bearerToken;

    if (!finalToken) {
        return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    try {
        const decoded = jwt.verify(finalToken, process.env.ACCESS_TOKEN_SECRET || process.env.BETTER_AUTH_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

const uri = "mongodb://docappoint:K07f7Kwz2nVzpdTj@ac-ppqx0gr-shard-00-00.9iyx4gw.mongodb.net:27017,ac-ppqx0gr-shard-00-01.9iyx4gw.mongodb.net:27017,ac-ppqx0gr-shard-00-02.9iyx4gw.mongodb.net:27017/docappoint?ssl=true&replicaSet=atlas-mxi3f3-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
})
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.log("Connection Error:", err.message));

const Doctor = mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }));

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

const reviewSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    doctorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

app.get('/', (req, res) => {
    res.send({ message: 'DocAppoint Server is running!' });
});

app.post('/jwt', async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || process.env.BETTER_AUTH_SECRET, { expiresIn: '1h' });
    res.send({ success: true, token });
});


app.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.send(doctors);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/appointments', verifyToken, async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        const result = await appointment.save();
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/appointments', verifyToken, async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email query parameter is required' });
        }

        if (req.user.email !== email) {
            return res.status(403).json({ success: false, message: 'Forbidden access' });
        }

        const appointments = await Appointment.find({ userEmail: email }).sort({ createdAt: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.patch('/appointments/:id', verifyToken, async (req, res) => {
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

app.delete('/appointments/:id', verifyToken, async (req, res) => {
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

app.post('/reviews', verifyToken, async (req, res) => {
    try {
        const { userEmail, doctorName } = req.body;
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

app.get('/reviews', verifyToken, async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email query parameter is required' });
        }

        if (req.user.email !== email) {
            return res.status(403).json({ success: false, message: 'Forbidden access' });
        }

        const reviews = await Review.find({ userEmail: email }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

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

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(` Server is running on port ${port}`);
    });
}

module.exports = app;