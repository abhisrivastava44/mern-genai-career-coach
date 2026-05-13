import { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const result = await handleLogin({ email, password });

    if (result && result.success) {
      navigate("/"); // Only go to home page if successful!
    } else {
      setErrorMsg(result?.error || "Invalid email or password");
    }
  };

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
        <h1>Login</h1>
        {errorMsg && (
          <div
            style={{
              backgroundColor: "rgba(255, 45, 120, 0.1)",
              color: "#ff2d78",
              border: "1px solid #ff2d78",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              type="email"
              id="email"
              name="email"
              placeholder="Enter Your email address"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              type="password"
              id="password"
              name="password"
              placeholder="Enter Your password"
            />
          </div>
          <button className="button primary-button">Login</button>
        </form>
        <p>
          Don't have an account? <Link to={"/register"}>Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
