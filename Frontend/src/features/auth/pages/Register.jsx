import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { sendOtpApi } from "../services/auth.api";

const Register = () => {
  // ==========================================
  // 1. HOOKS & NAVIGATION
  // ==========================================
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();

  // ==========================================
  // 2. STATE MANAGEMENT
  // ==========================================
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Controls Stage 1 (Details) vs Stage 2 (OTP)
  const [isSendingOtp, setIsSendingOtp] = useState(false); // Controls button loading state
  const [feedback, setFeedback] = useState({ type: "", text: "" }); // Handles Success/Error UI

  // ==========================================
  // 3. LOGIC HANDLERS
  // ==========================================

  /**
   * Sends OTP to the provided email and moves UI to Step 2
   */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });
    setIsSendingOtp(true);

    try {
      await sendOtpApi(email);
      setStep(2);
      setFeedback({
        type: "success",
        text: "✅ OTP sent successfully! Check your inbox.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error.response?.data?.message ||
          "❌ Failed to send OTP. Please try again.",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  /**
   * Finalizes registration after OTP verification
   */
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });

    const result = await handleRegister({ username, email, password, otp });

    if (result?.error) {
      setFeedback({ type: "error", text: result.error });
    } else {
      navigate("/");
    }
  };

  // ==========================================
  // 4. RENDER LOGIC
  // ==========================================
  if (loading) {
    return (
      <main>
        <h1>Loading......</h1>
      </main>
    );
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>

        {/* FEEDBACK BANNER (Dynamic Success/Error display) */}
        {feedback.text && (
          <div
            style={{
              backgroundColor:
                feedback.type === "success"
                  ? "rgba(40, 167, 69, 0.1)"
                  : "rgba(255, 45, 120, 0.1)",
              color: feedback.type === "success" ? "#28a745" : "#ff2d78",
              border: `1px solid ${feedback.type === "success" ? "#28a745" : "#ff2d78"}`,
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            {feedback.text}
          </div>
        )}

        {/* STEP 1: COLLECT USER DETAILS */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                onChange={(event) => setUsername(event.target.value)}
                value={username}
                type="text"
                id="username"
                name="username"
                placeholder="Enter Your username"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                onChange={(event) => setEmail(event.target.value)}
                value={email}
                type="email"
                id="email"
                name="email"
                placeholder="Enter Your email address"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                onChange={(event) => setPassword(event.target.value)}
                value={password}
                type="password"
                id="password"
                name="password"
                placeholder="Enter Your password"
                required
              />
            </div>
            <button
              className="button primary-button"
              disabled={isSendingOtp}
              style={{ opacity: isSendingOtp ? 0.7 : 1 }}
            >
              {isSendingOtp ? "⏳ Sending OTP..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP VERIFICATION */
          <form onSubmit={handleVerifyAndRegister}>
            <p
              style={{
                marginBottom: "1rem",
                color: "#7d8590",
                textAlign: "center",
              }}
            >
              Code sent to <strong>{email}</strong>
            </p>
            <div className="input-group">
              <label htmlFor="otp">Enter 6-Digit OTP</label>
              <input
                onChange={(event) => setOtp(event.target.value)}
                value={otp}
                type="text"
                id="otp"
                name="otp"
                placeholder="123456"
                required
                maxLength="6"
                style={{
                  letterSpacing: "5px",
                  textAlign: "center",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              />
            </div>
            <button className="button primary-button">Verify & Register</button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setFeedback({ type: "", text: "" });
              }}
              style={{
                background: "none",
                border: "none",
                color: "#ff2d78",
                cursor: "pointer",
                marginTop: "1rem",
                width: "100%",
                fontWeight: "bold",
              }}
            >
              Go back
            </button>
          </form>
        )}

        {/* FOOTER LINK */}
        <p style={{ marginTop: "1.5rem" }}>
          Already have an account? <Link to={"/login"}>Login</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
