import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  Lock,
  ArrowRight,
  Share2,
} from "lucide-react";
import { register } from "../api/authApi";
import "bootstrap/dist/css/bootstrap.min.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Phone number validation - only allows numbers, spaces, hyphens, and plus sign
  const validatePhoneInput = (value) => {
    return value.replace(/[^0-9+\s-]/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData({
        ...formData,
        [name]: validatePhoneInput(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (response.data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 w-100 bg-dark d-flex justify-content-center align-items-center p-3 p-sm-4">
      <div className="w-100" style={{ maxWidth: "520px" }}>
        {/* Register Card */}
        <div
          className="bg-dark bg-opacity-50 rounded-4 border border-secondary p-3 p-sm-5"
          style={{ backdropFilter: "blur(10px)" }}
        >
          {/* Logo Section */}
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center">
              <div
                className="bg-primary rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "64px",
                  height: "64px",
                  boxShadow: "0 4px 12px rgba(13, 110, 253, 0.3)",
                }}
              >
                <Share2
                  size={28}
                  className="text-white"
                  style={{ transform: "rotate(45deg)" }}
                />
              </div>
            </div>
            <h1 className="h2 fw-bold text-white mt-3">EMAZ CMS</h1>
            <p className="text-light small fw-medium opacity-75">
              Connect. Manage. Scale.
            </p>
          </div>

          {/* Header Section */}
          <div className="text-center mb-4">
            <h2 className="h4 fw-semibold text-white">Create your account</h2>
            <p className="text-light opacity-75 small">
              Join EMAZ CMS and streamline your relationships
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="alert alert-success py-2 mb-3" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* First & Last Name Row */}
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label
                  htmlFor="firstName"
                  className="form-label text-uppercase fw-semibold small text-light opacity-75"
                >
                  First Name
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-white">
                    <User size={16} className="text-primary" />
                  </span>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="form-control bg-dark border-secondary text-white border-start-0"
                    placeholder="Ahmed"
                    style={{ color: "white" }}
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-12 col-md-6">
                <label
                  htmlFor="lastName"
                  className="form-label text-uppercase fw-semibold small text-light opacity-75"
                >
                  Last Name
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-white">
                    <User size={16} className="text-primary" />
                  </span>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="form-control bg-dark border-secondary text-white border-start-0"
                    placeholder="Khan"
                    style={{ color: "white" }}
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label
                htmlFor="email"
                className="form-label text-uppercase fw-semibold small text-light opacity-75"
              >
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-white">
                  <Mail size={18} className="text-primary" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control bg-dark border-secondary text-white border-start-0"
                  placeholder="ahmed.khan@email.com"
                  style={{ color: "white" }}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label
                htmlFor="phone"
                className="form-label text-uppercase fw-semibold small text-light opacity-75"
              >
                Phone Number
              </label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-white">
                  <Phone size={18} className="text-primary" />
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className="form-control bg-dark border-secondary text-white border-start-0"
                  placeholder="0300-1234567"
                  style={{ color: "white" }}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label
                  htmlFor="password"
                  className="form-label text-uppercase fw-semibold small text-light opacity-75"
                >
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-white">
                    <Lock size={16} className="text-primary" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-dark border-secondary text-white border-start-0"
                    placeholder="••••••••"
                    style={{ color: "white" }}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-dark border-secondary text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <label
                  htmlFor="confirmPassword"
                  className="form-label text-uppercase fw-semibold small text-light opacity-75"
                >
                  Confirm Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-white">
                    <Lock size={16} className="text-primary" />
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control bg-dark border-secondary text-white border-start-0"
                    placeholder="••••••••"
                    style={{ color: "white" }}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-dark border-secondary text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="mb-3 d-flex align-items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 flex-shrink-0"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="terms" className="text-light opacity-75 small">
                I agree to the{" "}
                <a href="#" className="text-primary text-decoration-none">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary text-decoration-none">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-4">
            <small className="text-light opacity-75">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary fw-semibold text-decoration-none"
              >
                Sign in
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
