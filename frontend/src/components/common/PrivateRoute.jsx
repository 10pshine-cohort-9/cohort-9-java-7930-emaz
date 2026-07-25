import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // Check if user is logged in (token exists)
  const isAuthenticated = localStorage.getItem("token") !== null;

  // If not authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
