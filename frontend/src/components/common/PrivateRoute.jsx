import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const PrivateRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from localStorage with error handling
        let token = null;
        try {
          token = localStorage.getItem("token");
        } catch (storageError) {
          console.warn("LocalStorage access failed:", storageError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // If no token, not authenticated
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // TODO: Validate token with backend
        // For now, check if token is not empty
        const isValid = token.length > 0;

        // If token is invalid, clear it
        if (!isValid) {
          try {
            localStorage.removeItem("token");
          } catch (e) {
            console.error("Failed to remove invalid token:", e);
          }
        }

        setIsAuthenticated(isValid);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
