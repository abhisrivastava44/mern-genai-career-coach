import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const data = await login(credentials);
      // Make sure data exists before trying to set the user!
      if (data && data.username) {
        setUser({ username: data.username, email: data.email });
        return { success: true };
      }
    } catch (error) {
      // Safely catch the error so the app doesn't crash
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Invalid email or password",
      };
    } finally {
      setLoading(false);
    }
  };

  // Make sure 'otp' is in these parameters too!
  const handleRegister = async ({ username, email, password, otp }) => {
    setLoading(true);
    try {
      // Pass the otp to the api function
      const data = await register({ username, email, password, otp });

      if (data && data.user) {
        setUser({ username: data.user.username, email: data.user.email });
        return { success: true };
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to get user:", error);
      } finally {
        setLoading(false);
      }
    };
    getAndSetUser();
  }, [setLoading, setUser]);

  return { user, loading, handleRegister, handleLogin, handleLogout };
};
