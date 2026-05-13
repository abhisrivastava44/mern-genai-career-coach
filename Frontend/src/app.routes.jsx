import { createBrowserRouter, Navigate } from "react-router";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Interview from "./features/interview/pages/Interview";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/interview/:interviewId",
    element: (
      <Protected>
        <Interview />
      </Protected>
    ),
  },

  // Catch-all — redirects any unknown URL to /login
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
