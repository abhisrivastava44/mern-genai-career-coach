const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");
const nodemailer = require("nodemailer");
const otpModel = require("../models/otp.model");

/**
 * @name sendOtpController
 * @description Generates and sends OTP, clearing previous ones first.
 */
async function sendOtpController(request, response) {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ message: "Email is required" });
  }

  const isUserExists = await userModel.findOne({ email });
  if (isUserExists) {
    return response.status(400).json({ message: "Email already registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // CLEANUP: Ensure no old OTPs exist
    await otpModel.deleteMany({ email: email.toLowerCase() });
    await otpModel.create({ email: email.toLowerCase(), otp });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your CareerCoach Verification Code",
      html: `<h2>Your verification code is: <b style="color: #ff2d78;">${otp}</b></h2>`,
    };

    await transporter.sendMail(mailOptions);
    response.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Error:", error);
    response.status(500).json({ message: "Failed to send OTP" });
  }
}

/**
 * @name registerUserController
 */
async function registerUserController(request, response) {
  const { username, email, password, otp } = request.body;

  if (!username || !email || !password || !otp) {
    return response.status(400).json({ message: "All fields are required" });
  }

  try {
    // VERIFICATION: Check OTP as a string
    const validOtp = await otpModel.findOne({
      email: email.toLowerCase().trim(),
      otp: otp.toString(),
    });

    if (!validOtp) {
      return response.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isUseralreadyExists = await userModel.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
    });

    if (isUseralreadyExists) {
      return response
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email: email.toLowerCase(),
      password: hash,
    });

    await otpModel.deleteMany({ email: email.toLowerCase() });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    response.cookie("token", token);
    response.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    response.status(500).json({ message: "Registration failed" });
  }
}

/**
 * @name loginUserController
 */
async function loginUserController(request, response) {
  const { email, password } = request.body;
  const user = await userModel.findOne({ email: email.toLowerCase() });

  if (!user) {
    return response.status(400).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return response.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  response.cookie("token", token);
  response.status(200).json({
    message: "User loggedIn successfully",
    username: user.username,
    email: user.email,
  });
}

/**
 * @name logoutUserController
 */
async function logoutUserController(request, response) {
  const token = request.cookies.token;
  if (token) {
    await tokenBlacklistModel.create({ token });
  }
  response.clearCookie("token");
  response.status(200).json({ message: "User logged out successfully" });
}

/**
 * @name getMeController
 */
async function getMeController(request, response) {
  const user = await userModel.findById(request.user.id);
  response.status(200).json({
    message: "User details fetched successfully",
    user: { id: user._id, username: user.username, email: user.email },
  });
}

// MAKE SURE ALL FUNCTIONS ARE EXPORTED HERE
module.exports = {
  sendOtpController,
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};
