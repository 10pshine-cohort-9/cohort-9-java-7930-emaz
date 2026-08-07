import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Share2,
  Edit,
  LogOut,
  ArrowLeft,
  Key,
  X,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import {
  getProfile,
  updateProfile,
  changePassword,
  logout,
} from "../api/authApi";
import "bootstrap/dist/css/bootstrap.min.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Current user data - fetched from API
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    verified: true,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getProfile();
      if (response.data.success) {
        setUser({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone || "Not provided",
          verified: true,
        });
        setEditForm({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone || "",
        });
      }
    } catch (err) {
      setError("Failed to load profile. Please try again.");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToastMessage("Passwords do not match", "danger");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToastMessage("Password must be at least 6 characters", "danger");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      showToastMessage("Password changed successfully", "success");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showToastMessage(
        err.response?.data?.message || "Password change failed",
        "danger",
      );
    }
  };

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Ignore error
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const openEditModal = () => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone === "Not provided" ? "" : user.phone,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
      });
      if (response.data.success) {
        setUser({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone || "Not provided",
          verified: true,
        });
        showToastMessage("Profile updated successfully", "success");
        setShowEditModal(false);
      }
    } catch (err) {
      showToastMessage(
        err.response?.data?.message || "Update failed",
        "danger",
      );
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return "?";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 w-100 bg-dark d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 w-100 bg-dark d-flex justify-content-center align-items-center">
        <div className="text-center">
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={fetchProfile}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 w-100 bg-dark">
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`position-fixed top-0 end-0 m-2 m-sm-4 p-2 p-sm-3 rounded-3 text-white ${
            toastType === "success"
              ? "bg-success"
              : toastType === "danger"
                ? "bg-danger"
                : "bg-primary"
          }`}
          style={{
            zIndex: 9999,
            minWidth: "200px",
            maxWidth: "90%",
            animation: "slideIn 0.3s ease-out",
            fontSize: "14px",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0%); opacity: 1; }
          }
          .verified-pill {
            background: #e0f2fe;
            color: #0369a1;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
          }
          .security-inner-box {
            background: #1a1a2e;
            border: 1px solid #2d2d44;
            border-radius: 8px;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
          }
          @media (max-width: 640px) {
            .security-inner-box {
              flex-direction: column;
              align-items: stretch;
              padding: 16px;
            }
            .security-actions-group {
              width: 100%;
              flex-direction: column;
            }
            .security-actions-group .btn {
              width: 100%;
              text-align: center;
            }
            .profile-hero {
              flex-direction: column;
              align-items: center !important;
              text-align: center;
            }
            .profile-avatar {
              width: 80px !important;
              height: 80px !important;
              font-size: 32px !important;
            }
            .profile-name-section {
              justify-content: center !important;
            }
            .profile-edit-btn {
              width: 100%;
              justify-content: center;
            }
          }
        `}
      </style>

      {/* TOP NAVIGATION */}
      <nav
        className="bg-dark border-bottom border-secondary p-2 p-sm-3 d-flex flex-wrap align-items-center justify-content-between sticky-top"
        style={{ zIndex: 100, gap: "8px" }}
      >
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          <button
            className="btn btn-sm btn-outline-secondary border-0 text-secondary"
            onClick={() => navigate("/contacts")}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <Share2
              size={20}
              className="text-primary"
              style={{ transform: "rotate(45deg)" }}
            />
            <span className="text-white fw-bold fs-6 d-none d-sm-inline">
              EMAZ CMS
            </span>
            <span className="text-white fw-bold fs-6 d-sm-none">CMS</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 gap-sm-3">
          <span
            className="text-white d-none d-sm-inline"
            style={{ fontSize: "13px", fontWeight: "500" }}
          >
            {user.firstName}
          </span>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "34px",
              height: "34px",
              border: "2px solid #0052cc",
              backgroundColor: "#0052cc",
              cursor: "pointer",
            }}
            onClick={() => navigate("/profile")}
          >
            <span className="text-white fw-bold" style={{ fontSize: "12px" }}>
              {getInitials(user.firstName, user.lastName)}
            </span>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div
        className="container py-3 py-sm-4 px-2 px-sm-3"
        style={{ maxWidth: "800px" }}
      >
        {/* Hero Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 mb-sm-4 gap-3 profile-hero">
          <div className="d-flex align-items-center gap-3 gap-sm-4 flex-wrap justify-content-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center profile-avatar"
              style={{
                width: "90px",
                height: "90px",
                backgroundColor: "#0052cc",
                border: "3px solid #1a1a2e",
                fontSize: "36px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap profile-name-section">
              <h1 className="h4 h3-sm fw-bold text-white mb-0">
                {user.firstName} {user.lastName}
              </h1>
              <span className="verified-pill">Verified</span>
            </div>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 profile-edit-btn"
            onClick={openEditModal}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        </div>

        {/* Personal Information Card */}
        <div className="bg-dark bg-opacity-50 rounded-4 border border-secondary p-3 p-sm-4 mb-3 mb-sm-4">
          <div className="d-flex justify-content-between align-items-center mb-3 mb-sm-4">
            <h5 className="fw-bold text-white mb-0 fs-6 fs-sm-5">
              Personal Information
            </h5>
            <User size={18} className="text-secondary" />
          </div>
          <div className="row g-3 g-sm-4">
            <div className="col-12 col-md-6">
              <div className="text-secondary small fw-semibold text-uppercase">
                Full Name
              </div>
              <div className="text-white" style={{ fontSize: "15px" }}>
                {user.firstName} {user.lastName}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-secondary small fw-semibold text-uppercase">
                Email Address
              </div>
              <div className="text-white" style={{ fontSize: "15px" }}>
                {user.email}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-secondary small fw-semibold text-uppercase">
                Phone Number
              </div>
              <div className="text-white" style={{ fontSize: "15px" }}>
                {user.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Account Security Card */}
        <div className="bg-dark bg-opacity-50 rounded-4 border border-secondary p-3 p-sm-4 mb-3 mb-sm-4">
          <div className="d-flex justify-content-between align-items-center mb-3 mb-sm-4">
            <h5 className="fw-bold text-white mb-0 fs-6 fs-sm-5">
              Account Security
            </h5>
            <Shield size={18} className="text-secondary" />
          </div>
          <div className="security-inner-box">
            <div>
              <h6 className="fw-bold text-white mb-1 fs-6">
                Password and Authentication
              </h6>
              <p className="text-secondary small mb-0">
                Manage your password and secure your account with 2FA.
              </p>
            </div>
            <div className="security-actions-group d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={openLogoutModal}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top border-secondary gap-2">
          <small className="text-light opacity-50" style={{ fontSize: "11px" }}>
            © 2026 EMAZ CMS Inc. All rights reserved.
          </small>
          <div className="d-flex gap-2 gap-sm-3 flex-wrap">
            <a
              href="#"
              className="text-light opacity-50 text-decoration-none small"
              style={{ fontSize: "11px" }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-light opacity-50 text-decoration-none small"
              style={{ fontSize: "11px" }}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeEditModal}
        >
          <div
            className="bg-dark rounded-4 border border-secondary p-3 p-sm-4"
            style={{
              maxWidth: "460px",
              width: "100%",
              position: "relative",
              margin: "16px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-sm btn-outline-secondary border-0 text-secondary position-absolute"
              onClick={closeEditModal}
              style={{ top: "16px", right: "16px" }}
            >
              <X size={18} />
            </button>

            <div className="text-center mb-3 mb-sm-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 mb-sm-3"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "rgba(13, 110, 253, 0.15)",
                }}
              >
                <User size={22} className="text-primary" />
              </div>
              <h4 className="fw-bold text-white mb-1 fs-5">Edit Profile</h4>
              <p className="text-light opacity-75 small mb-0">
                Update your personal information.
              </p>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="mb-3">
                <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1 d-block">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Enter first name"
                  value={editForm.firstName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1 d-block">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Enter last name"
                  value={editForm.lastName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1 d-block">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Enter email address"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1 d-block">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Enter phone number"
                  value={editForm.phone}
                  onChange={handleEditChange}
                />
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1 flex-sm-grow-0"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 flex-sm-grow-0"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-dark rounded-4 border border-secondary p-3 p-sm-4"
            style={{
              maxWidth: "460px",
              width: "100%",
              position: "relative",
              margin: "16px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-sm btn-outline-secondary border-0 text-secondary position-absolute"
              onClick={() => setShowPasswordModal(false)}
              style={{ top: "16px", right: "16px" }}
            >
              <X size={18} />
            </button>

            <div className="text-center mb-3 mb-sm-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 mb-sm-3"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "rgba(13, 110, 253, 0.15)",
                }}
              >
                <Key size={22} className="text-primary" />
              </div>
              <h4 className="fw-bold text-white mb-1 fs-5">Change Password</h4>
              <p className="text-light opacity-75 small mb-0">
                Enter your current password and choose a new one.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1 d-block">
                  Current Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
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

              <div className="mb-3">
                <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1 d-block">
                  New Password
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="newPassword"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="btn btn-dark border-secondary text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1 d-block">
                  Confirm New Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1 flex-sm-grow-0"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 flex-sm-grow-0"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeLogoutModal}
        >
          <div
            className="bg-dark rounded-4 border border-secondary p-3 p-sm-4 text-center"
            style={{
              maxWidth: "460px",
              width: "100%",
              position: "relative",
              margin: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-sm btn-outline-secondary border-0 text-secondary position-absolute"
              onClick={closeLogoutModal}
              style={{ top: "16px", right: "16px" }}
            >
              <X size={18} />
            </button>

            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(220, 53, 69, 0.15)",
              }}
            >
              <LogOut size={22} className="text-danger" />
            </div>

            <h4 className="fw-bold text-white mb-2 fs-5">Log Out</h4>
            <p className="text-light opacity-75 small mb-4">
              Are you sure you want to log out of your account?
            </p>

            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary px-3 px-sm-4 flex-grow-1 flex-sm-grow-0"
                onClick={closeLogoutModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary px-3 px-sm-4 flex-grow-1 flex-sm-grow-0"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
