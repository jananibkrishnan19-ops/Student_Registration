const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_registration';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Student Registration API is running',
    status: 'ok',
  });
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected',
  });
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ submittedAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const studentData = req.body;

    if (!studentData.studentName || !studentData.email || !studentData.rollNo) {
      return res.status(400).json({ message: 'Student name, email, and roll number are required.' });
    }

    const student = new Student({
      ...studentData,
      submittedAt: new Date(),
    });

    const savedStudent = await student.save();
    res.status(201).json({ message: 'Student registered successfully', student: savedStudent });
  } catch (error) {
    res.status(400).json({ message: 'Student registration failed', error: error.message });
  }
});

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
