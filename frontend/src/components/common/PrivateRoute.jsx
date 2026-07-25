import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const getToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.warn("LocalStorage access denied:", error);
    return null;
  }
};

const isValidToken = (token) => {
  if (!token) return false;
  if (typeof token !== "string") return false;
  if (token.trim().length === 0) return false;
  return true;
};

const PrivateRoute = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const token = getToken();
      const valid = isValidToken(token);
      setIsAuthenticated(valid);

      if (!valid && token) {
        try {
          localStorage.removeItem("token");
        } catch (e) {}
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsValidating(false);
    }
  }, []);

  if (isValidating) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
