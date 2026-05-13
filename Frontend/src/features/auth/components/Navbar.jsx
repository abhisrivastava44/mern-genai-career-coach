import React from "react";
import { Link, useNavigate } from "react-router"; // or react-router-dom depending on your version
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#161b22",
        borderBottom: "1px solid #2a3348",
        color: "white",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        🚀 CareerCoach AI
      </div>

      <div>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "#7d8590", fontSize: "0.9rem" }}>
              Welcome, {user.username || "User"}
            </span>
            <button
              onClick={onLogout}
              style={{
                backgroundColor: "#2a3348",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              color: "#ff2d78",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
