const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  gender: String,
  bloodGroup: String,
  rollNo: { type: String, required: true },
  dob: String,
  email: { type: String, required: true },
  address: String,
  phoneNumber: String,
  department: String,
  year: String,
  section: String,
  arrears: { type: Number, default: 0 },
  companySelections: [String],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Student', studentSchema, 'students');
