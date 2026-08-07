import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Share2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginPage = () => {
  // State management for form inputs and password visibility
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ emailOrPhone, password });

      if (response.data.success) {
        // Store token and user info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.id,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            phone: response.data.phone,
          }),
        );

        // Redirect to contacts page
        navigate("/contacts");
        console.log("Login successful!");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 w-100 bg-dark d-flex flex-column justify-content-between align-items-center p-3 p-sm-4">
      {/* Spacer for desktop view */}
      <div className="d-none d-sm-block" style={{ height: "32px" }}></div>

      <div className="w-100" style={{ maxWidth: "460px" }}>
        {/* Header / Brand Logo Section */}
        <div className="text-center mb-3 mb-sm-4">
          <div className="d-flex justify-content-center">
            <div
              className="bg-primary rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "56px",
                height: "56px",
                boxShadow: "0 4px 12px rgba(13, 110, 253, 0.3)",
              }}
            >
              <Share2
                size={24}
                className="text-white"
                style={{ transform: "rotate(45deg)" }}
              />
            </div>
          </div>
          <h1 className="h3 h2-sm fw-bold text-white mt-2 mt-sm-3">EMAZ CMS</h1>
          <p className="text-light small fw-medium opacity-75 mb-0">
            Connect. Manage. Scale.
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-dark bg-opacity-50 rounded-4 border border-secondary p-3 p-sm-5"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <div className="mb-3 mb-sm-4">
            <h2 className="h5 h4-sm fw-semibold text-white">Welcome back</h2>
            <p className="text-light opacity-75 small mb-0">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-3">
              <label
                htmlFor="identifier"
                className="form-label text-uppercase fw-semibold small text-light opacity-75"
              >
                Email or Phone
              </label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-white">
                  <Mail size={18} className="text-primary" />
                </span>
                <input
                  id="identifier"
                  type="text"
                  className="form-control bg-dark border-secondary text-white border-start-0"
                  placeholder="name@company.com"
                  style={{ color: "white" }}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-3">
              <label
                htmlFor="password"
                className="form-label text-uppercase fw-semibold small text-light opacity-75"
              >
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-white">
                  <Lock size={18} className="text-primary" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control bg-dark border-secondary text-white border-start-0"
                  placeholder="Enter password"
                  style={{ color: "white" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-dark border-secondary text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to CMS"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-3 mt-sm-4">
            <small className="text-light opacity-75">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary fw-semibold text-decoration-none"
              >
                Register
              </Link>
            </small>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="w-100 text-center mt-4 mt-sm-5 small text-light opacity-50"
        style={{ maxWidth: "460px" }}
      >
        <p className="mb-1 mb-sm-2">
          © 2026 EMAZ CMS Systems Inc. All rights reserved.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <a
            href="#privacy"
            className="text-light text-decoration-none small opacity-75"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            className="text-light text-decoration-none small opacity-75"
          >
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
