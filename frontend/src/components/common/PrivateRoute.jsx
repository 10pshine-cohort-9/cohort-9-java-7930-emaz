import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // Check if user is logged in (token exists) - with error handling
  const isAuthenticated = () => {
    try {
      const token = localStorage.getItem("token");
      return token !== null && token.length > 0;
    } catch (error) {
      console.warn("Authentication check failed:", error);
      return false;
    }
  };

  // Validate token format (basic check)
  const isValidToken = (token) => {
    if (!token) return false;
    // Basic JWT format check: header.payload.signature
    const parts = token.split(".");
    return parts.length === 3;
  };

  const token = localStorage.getItem("token");
  const valid = isAuthenticated() && token && isValidToken(token);

  // If token is present but invalid, remove it with error reporting
  if (!valid && token) {
    try {
      localStorage.removeItem("token");
    } catch (e) {
      console.error("Failed to remove invalid token:", e);
    }
  }

  // If not authenticated, redirect to login
  return valid ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
