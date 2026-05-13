const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = Router();

/**
 * @route POST /api/auth/send-otp
 * @description Sends a 6-digit OTP to the user's email
 * @access Public
 */
authRouter.post("/send-otp", authController.sendOtpController); // ADDED THIS LINE

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description Login User with email and password
 * @access Public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */
authRouter.get("/logout", authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access Private
 */
authRouter.get(
  "/get-me",
  authMiddleware.authUser,
  authController.getMeController,
);

module.exports = authRouter;
