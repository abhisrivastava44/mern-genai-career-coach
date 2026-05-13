const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true, // AUTO-CORRECT: Saves everything in lowercase to prevent "Abhi@G" vs "abhi@g" errors
    trim: true, // CLEANUP: Removes accidental leading/trailing spaces
  },
  otp: {
    type: String, // STRING TYPE: Better for comparison with frontend text inputs
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // AUTO-DELETE: MongoDB clears this after 5 minutes (300 seconds)
  },
});

const otpModel = mongoose.model("OTP", otpSchema);
module.exports = otpModel;
