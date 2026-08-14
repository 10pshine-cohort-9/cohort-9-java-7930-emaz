import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Share2,
  X,
  Mail,
  Phone,
  Briefcase,
  UserPlus,
  AlertTriangle,
  Copy,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getContacts,
  searchContacts,
  createContact,
  updateContact,
  deleteContact,
  exportContacts,
} from "../api/contactApi";
import "bootstrap/dist/css/bootstrap.min.css";

const ContactsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for modal focus
  const addModalRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const viewModalRef = useRef(null);
  const logoutModalRef = useRef(null);

  // Current logged in user - read from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const user = localStorage.getItem("user");
      return user
        ? JSON.parse(user)
        : {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@emaz.com",
            avatar: "JD",
            color: "#0052cc",
          };
    } catch {
      return {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@emaz.com",
        avatar: "JD",
        color: "#0052cc",
      };
    }
  });

  // Form state for new contact
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    title: "",
    emails: [{ label: "work", value: "" }],
    phones: [{ label: "work", value: "" }],
  });

  // Form state for editing contact
  const [editContact, setEditContact] = useState({
    id: null,
    firstName: "",
    lastName: "",
    title: "",
    emails: [{ label: "work", value: "" }],
    phones: [{ label: "work", value: "" }],
  });

  // ========== HELPER: Get Error Message ==========
  const getErrorMessage = (err) => {
    const data = err.response?.data;
    if (data?.error) return data.error;
    if (data?.fieldErrors) {
      const errors = Object.values(data.fieldErrors);
      return errors.join(", ");
    }
    if (data?.errors) return data.errors;
    return "An error occurred";
  };

  // ========== HELPER: Pluralization ==========
  const getContactText = (count) => {
    return count === 1 ? "contact" : "contacts";
  };

  // ========== FETCH CONTACTS ==========
  const fetchContacts = async (page = currentPage, search = searchTerm) => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (search.trim()) {
        response = await searchContacts(search, page, pageSize);
      } else {
        response = await getContacts(page, pageSize);
      }

      const data = response.data;
      setContacts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(data.number || 0);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
      console.error("Error fetching contacts:", err);
      showToastMessage("Failed to load contacts", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Load contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // ========== TOAST ==========
  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // ========== PHONE VALIDATION ==========
  const validatePhoneInput = (value) => {
    return value.replace(/[^0-9+\s-]/g, "");
  };

  // ========== SEARCH ==========
  const handleSearch = () => {
    fetchContacts(0, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchContacts(0, "");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ========== HELPER: Get Email/Phone from API Response ==========
  const getContactEmail = (contact) => {
    if (contact.emails && contact.emails.length > 0) {
      return contact.emails[0].value;
    }
    return contact.email || "";
  };

  const getContactPhone = (contact) => {
    if (contact.phones && contact.phones.length > 0) {
      return contact.phones[0].value;
    }
    return contact.phone || "";
  };

  // ========== MODAL KEYBOARD ACCESSIBILITY ==========
  const handleModalKeyDown = (e, closeModal) => {
    if (e.key === "Escape") {
      closeModal();
    }
  };

  // ========== ADD MODAL ==========
  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewContact({
      firstName: "",
      lastName: "",
      title: "",
      emails: [{ label: "work", value: "" }],
      phones: [{ label: "work", value: "" }],
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" || name.includes("phone")) {
      setNewContact({
        ...newContact,
        [name]: validatePhoneInput(value),
      });
    } else {
      setNewContact({
        ...newContact,
        [name]: value,
      });
    }
  };

  const handleEmailChange = (index, field, value) => {
    const updatedEmails = newContact.emails.map((email, i) => {
      if (i === index) {
        return { ...email, [field]: value };
      }
      return email;
    });
    setNewContact({ ...newContact, emails: updatedEmails });
  };

  const handlePhoneChange = (index, field, value) => {
    const updatedPhones = newContact.phones.map((phone, i) => {
      if (i === index) {
        return {
          ...phone,
          [field]: field === "value" ? validatePhoneInput(value) : value,
        };
      }
      return phone;
    });
    setNewContact({ ...newContact, phones: updatedPhones });
  };

  const addEmailField = () => {
    setNewContact({
      ...newContact,
      emails: [...newContact.emails, { label: "work", value: "" }],
    });
  };

  const addPhoneField = () => {
    setNewContact({
      ...newContact,
      phones: [...newContact.phones, { label: "work", value: "" }],
    });
  };

  const removeEmailField = (index) => {
    if (newContact.emails.length > 1) {
      const updatedEmails = newContact.emails.filter((_, i) => i !== index);
      setNewContact({ ...newContact, emails: updatedEmails });
    }
  };

  const removePhoneField = (index) => {
    if (newContact.phones.length > 1) {
      const updatedPhones = newContact.phones.filter((_, i) => i !== index);
      setNewContact({ ...newContact, phones: updatedPhones });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createContact({
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        title: newContact.title,
        emails: newContact.emails.filter((e) => e.value.trim()),
        phones: newContact.phones.filter((p) => p.value.trim()),
      });

      showToastMessage(
        `${newContact.firstName} ${newContact.lastName} added successfully!`,
        "success",
      );
      closeAddModal();
      fetchContacts();
    } catch (err) {
      showToastMessage(
        getErrorMessage(err) || "Failed to add contact",
        "danger",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== EDIT MODAL ==========
  const openEditModal = (contact) => {
    setEditingContact(contact);
    setEditContact({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title || "",
      emails: contact.emails?.map((e) => ({ ...e })) || [
        { label: "work", value: getContactEmail(contact) },
      ],
      phones: contact.phones?.map((p) => ({ ...p })) || [
        { label: "work", value: getContactPhone(contact) },
      ],
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingContact(null);
    setEditContact({
      id: null,
      firstName: "",
      lastName: "",
      title: "",
      emails: [{ label: "work", value: "" }],
      phones: [{ label: "work", value: "" }],
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" || name.includes("phone")) {
      setEditContact({
        ...editContact,
        [name]: validatePhoneInput(value),
      });
    } else {
      setEditContact({
        ...editContact,
        [name]: value,
      });
    }
  };

  const handleEditEmailChange = (index, field, value) => {
    const updatedEmails = editContact.emails.map((email, i) => {
      if (i === index) {
        return { ...email, [field]: value };
      }
      return email;
    });
    setEditContact({ ...editContact, emails: updatedEmails });
  };

  const handleEditPhoneChange = (index, field, value) => {
    const updatedPhones = editContact.phones.map((phone, i) => {
      if (i === index) {
        return {
          ...phone,
          [field]: field === "value" ? validatePhoneInput(value) : value,
        };
      }
      return phone;
    });
    setEditContact({ ...editContact, phones: updatedPhones });
  };

  const addEditEmailField = () => {
    setEditContact({
      ...editContact,
      emails: [...editContact.emails, { label: "work", value: "" }],
    });
  };

  const addEditPhoneField = () => {
    setEditContact({
      ...editContact,
      phones: [...editContact.phones, { label: "work", value: "" }],
    });
  };

  const removeEditEmailField = (index) => {
    if (editContact.emails.length > 1) {
      const updatedEmails = editContact.emails.filter((_, i) => i !== index);
      setEditContact({ ...editContact, emails: updatedEmails });
    }
  };

  const removeEditPhoneField = (index) => {
    if (editContact.phones.length > 1) {
      const updatedPhones = editContact.phones.filter((_, i) => i !== index);
      setEditContact({ ...editContact, phones: updatedPhones });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateContact(editContact.id, {
        firstName: editContact.firstName,
        lastName: editContact.lastName,
        title: editContact.title,
        emails: editContact.emails.filter((e) => e.value.trim()),
        phones: editContact.phones.filter((p) => p.value.trim()),
      });

      // ========== EXPORT HANDLER ==========
      const handleExport = async () => {
        try {
          const response = await exportContacts();

          // Create download link
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "contacts.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          showToastMessage("Contacts exported successfully!", "success");
        } catch (err) {
          showToastMessage("Failed to export contacts", "danger");
        }
      };

      showToastMessage(
        `${editContact.firstName} ${editContact.lastName} updated successfully!`,
        "success",
      );
      closeEditModal();
      fetchContacts();
    } catch (err) {
      showToastMessage(
        getErrorMessage(err) || "Failed to update contact",
        "danger",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== DELETE MODAL ==========
  const openDeleteModal = (contact) => {
    setDeletingContact(contact);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingContact(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContact) return;
    try {
      await deleteContact(deletingContact.id);
      showToastMessage(
        `${deletingContact.firstName} ${deletingContact.lastName} deleted successfully!`,
        "success",
      );
      closeDeleteModal();
      fetchContacts();
    } catch (err) {
      showToastMessage(
        getErrorMessage(err) || "Failed to delete contact",
        "danger",
      );
    }
  };

  // ========== VIEW MODAL ==========
  const openViewModal = (contact) => {
    setViewingContact(contact);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingContact(null);
  };

  // ========== COPY TO CLIPBOARD ==========
  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToastMessage(`${label} copied!`, "success");
      })
      .catch(() => {
        showToastMessage(`Failed to copy ${label}`, "danger");
      });
  };

  // ========== PROFILE MENU ==========
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const goToProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile");
  };

  const openLogoutModal = () => {
    setShowProfileMenu(false);
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const renderAvatar = (contact) => {
    if (contact.avatar && contact.avatar.startsWith("http")) {
      return (
        <img
          src={contact.avatar}
          alt={contact.firstName}
          className="rounded-circle"
          style={{ width: "36px", height: "36px", objectFit: "cover" }}
        />
      );
    }
    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          width: "36px",
          height: "36px",
          backgroundColor: contact.color || "#0052cc",
          fontSize: "12px",
        }}
      >
        {contact.avatar || getInitials(contact.firstName, contact.lastName)}
      </div>
    );
  };

  const renderUserAvatar = () => {
    if (currentUser.avatar && currentUser.avatar.startsWith("http")) {
      return (
        <img
          src={currentUser.avatar}
          alt={currentUser.firstName}
          className="rounded-circle"
          style={{ width: "36px", height: "36px", objectFit: "cover" }}
        />
      );
    }
    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          width: "36px",
          height: "36px",
          backgroundColor: currentUser.color || "#0052cc",
          fontSize: "12px",
        }}
      >
        {currentUser.avatar ||
          getInitials(currentUser.firstName, currentUser.lastName)}
      </div>
    );
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      fetchContacts(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest(".profile-menu-container")) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  // ========== RENDER ==========
  return (
    <div className="min-vh-100 w-100 bg-dark">
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`position-fixed top-0 end-0 m-3 p-3 rounded-3 text-white ${
            toastType === "success"
              ? "bg-success"
              : toastType === "danger"
                ? "bg-danger"
                : "bg-primary"
          }`}
          style={{
            zIndex: 9999,
            minWidth: "250px",
            animation: "slideIn 0.3s ease-out",
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
            to { transform: translateX(0); opacity: 1; }
          }
          .profile-menu-container { position: relative; }
          .profile-dropdown {
            position: absolute;
            top: 45px;
            right: 0;
            min-width: 180px;
            background: #1a1a2e;
            border: 1px solid #495057;
            border-radius: 12px;
            padding: 8px;
            z-index: 1000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          }
          .profile-dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            color: #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s;
            border: none;
            background: none;
            width: 100%;
            font-size: 14px;
          }
          .profile-dropdown-item:hover { background-color: rgba(255,255,255,0.05); }
          .profile-dropdown-item.text-danger:hover { background-color: rgba(220, 53, 69, 0.15); }
          .profile-dropdown-divider { height: 1px; background-color: #495057; margin: 6px 8px; }
          @media (max-width: 576px) {
            .profile-dropdown {
              position: fixed;
              top: auto;
              bottom: 0;
              left: 0;
              right: 0;
              border-radius: 16px 16px 0 0;
              min-width: unset;
              padding: 16px;
            }
            .table td, .table th { padding: 8px 6px; white-space: nowrap; }
          }
        `}
      </style>

      {/* Top Navigation */}
      <nav
        className="bg-dark border-bottom border-secondary p-2 p-sm-3 d-flex align-items-center justify-content-between sticky-top"
        style={{ zIndex: 100, gap: "8px", flexWrap: "nowrap" }}
      >
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

        <div
          className="position-relative"
          style={{ maxWidth: "450px", width: "100%", minWidth: "100px" }}
        >
          <Search
            size={16}
            className="position-absolute text-secondary"
            style={{
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
          />
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            style={{
              borderRadius: "8px",
              paddingLeft: "36px",
              paddingRight: searchTerm ? "36px" : "12px",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              border: "1px solid #495057",
              fontSize: "13px",
              height: "34px",
            }}
          />
          {searchTerm && (
            <button
              className="btn btn-sm position-absolute"
              onClick={clearSearch}
              style={{
                right: "4px",
                top: "50%",
                transform: "translateY(-50%)",
                padding: "2px 6px",
                zIndex: 2,
                background: "transparent",
                border: "none",
                color: "#6c757d",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="profile-menu-container d-flex align-items-center gap-2">
          <span
            className="text-white d-none d-md-inline"
            style={{ fontSize: "13px", fontWeight: "500" }}
          >
            {currentUser.firstName}
          </span>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "34px",
              height: "34px",
              cursor: "pointer",
              border: "2px solid #0052cc",
              backgroundColor: currentUser.color || "#0052cc",
            }}
            onClick={toggleProfileMenu}
          >
            {renderUserAvatar()}
          </div>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button className="profile-dropdown-item" onClick={goToProfile}>
                <User size={16} className="text-primary" />
                <span>My Profile</span>
              </button>
              <div className="profile-dropdown-divider"></div>
              <button
                className="profile-dropdown-item text-danger"
                onClick={openLogoutModal}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="container-fluid p-3 p-md-4"
        style={{ maxWidth: "1200px" }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-2">
          <div>
            <h1 className="text-white fw-bold mb-1">Contacts</h1>
            <p className="text-light opacity-75 small">
              {loading
                ? "Loading..."
                : `${totalElements} ${getContactText(totalElements)} found`}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={openAddModal}
            >
              <Plus size={16} />
              Add Contact
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-dark bg-opacity-50 rounded-4 border border-secondary p-5 text-center">
            <p className="text-danger">{error}</p>
            <button className="btn btn-primary" onClick={() => fetchContacts()}>
              Retry
            </button>
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-dark bg-opacity-50 rounded-4 border border-secondary p-5 text-center">
            <Search size={48} className="text-secondary mb-3" />
            <h4 className="text-white">No contacts found</h4>
            <p className="text-light opacity-75">
              {searchTerm
                ? `No results found for "${searchTerm}"`
                : "Start by adding your first contact!"}
            </p>
            {searchTerm ? (
              <button
                className="btn btn-outline-secondary"
                onClick={clearSearch}
              >
                Clear Search
              </button>
            ) : (
              <button className="btn btn-primary" onClick={openAddModal}>
                Add Contact
              </button>
            )}
          </div>
        ) : (
          <div className="bg-dark bg-opacity-50 rounded-4 border border-secondary overflow-hidden">
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead className="border-bottom border-secondary">
                  <tr>
                    <th className="text-light opacity-75 small fw-semibold px-3 py-3">
                      First Name
                    </th>
                    <th className="text-light opacity-75 small fw-semibold px-3 py-3">
                      Last Name
                    </th>
                    <th className="text-light opacity-75 small fw-semibold px-3 py-3">
                      Title
                    </th>
                    <th className="text-light opacity-75 small fw-semibold px-3 py-3">
                      Email
                    </th>
                    <th className="text-light opacity-75 small fw-semibold px-3 py-3">
                      Phone
                    </th>
                    <th className="text-light opacity-75 small fw-semibold px-3 py-3 text-end">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-bottom border-secondary"
                    >
                      <td className="px-3 py-3">
                        <div className="d-flex align-items-center gap-2">
                          {renderAvatar(contact)}
                          <span className="text-white fw-medium">
                            {contact.firstName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-white">
                        {contact.lastName}
                      </td>
                      <td className="px-3 py-3">
                        <span className="badge bg-primary bg-opacity-25 text-primary px-3 py-2 rounded-pill">
                          {contact.title}
                        </span>
                      </td>
                      <td
                        className="px-3 py-3 text-white-50"
                        style={{ fontSize: "14px" }}
                      >
                        {getContactEmail(contact)}
                      </td>
                      <td
                        className="px-3 py-3 text-white-50"
                        style={{ fontSize: "14px" }}
                      >
                        {getContactPhone(contact)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="d-flex gap-3 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-secondary border-0 text-secondary hover-text-primary"
                            onClick={() => openViewModal(contact)}
                            title="View Contact"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary border-0 text-secondary hover-text-warning"
                            onClick={() => openEditModal(contact)}
                            title="Edit Contact"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary border-0 text-secondary hover-text-danger"
                            onClick={() => openDeleteModal(contact)}
                            title="Delete Contact"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center p-3 border-top border-secondary gap-2">
              <span className="text-light opacity-75 small">
                Showing {contacts.length} of {totalElements}{" "}
                {getContactText(totalElements)}
              </span>
              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft size={16} />
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    className={`btn btn-sm ${currentPage === page ? "btn-primary" : "btn-outline-secondary border-0 text-secondary"}`}
                    onClick={() => handlePageChange(page)}
                    style={{ minWidth: "32px" }}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================ */}
      {/* ADD CONTACT MODAL */}
      {/* ============================================ */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-modal-title"
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeAddModal}
          onKeyDown={(e) => handleModalKeyDown(e, closeAddModal)}
        >
          <div
            ref={addModalRef}
            className="bg-dark rounded-4 border border-secondary"
            style={{
              maxWidth: "560px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              margin: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-primary rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px" }}
                >
                  <UserPlus size={22} className="text-white" />
                </div>
                <div>
                  <h5 id="add-modal-title" className="text-white fw-bold mb-0">
                    Add New Contact
                  </h5>
                  <p className="text-light opacity-75 small mb-0">
                    Fill in the details to create a new profile.
                  </p>
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                onClick={closeAddModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="p-4">
                {/* Form fields same as before */}
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label
                      htmlFor="add-firstName"
                      className="text-light opacity-75 small fw-semibold text-uppercase mb-1"
                    >
                      First Name
                    </label>
                    <input
                      id="add-firstName"
                      type="text"
                      name="firstName"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. Ahmed"
                      value={newContact.firstName}
                      onChange={handleFormChange}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="col-6">
                    <label
                      htmlFor="add-lastName"
                      className="text-light opacity-75 small fw-semibold text-uppercase mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      id="add-lastName"
                      type="text"
                      name="lastName"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. Khan"
                      value={newContact.lastName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="add-title"
                    className="text-light opacity-75 small fw-semibold text-uppercase mb-1"
                  >
                    Title
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <Briefcase size={18} />
                    </span>
                    <input
                      id="add-title"
                      type="text"
                      name="title"
                      className="form-control bg-dark text-white border-secondary border-start-0"
                      placeholder="e.g. Software Engineer"
                      value={newContact.title}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1">
                    Email Addresses
                  </label>
                  {newContact.emails.map((email, index) => (
                    <div key={index} className="d-flex gap-2 mb-2 flex-wrap">
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        style={{ width: "120px", flexShrink: 0 }}
                        value={email.label}
                        onChange={(e) =>
                          handleEmailChange(index, "label", e.target.value)
                        }
                      >
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="input-group flex-grow-1">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="form-control bg-dark text-white border-secondary border-start-0"
                          placeholder="ahmed.khan@email.com"
                          value={email.value}
                          onChange={(e) =>
                            handleEmailChange(index, "value", e.target.value)
                          }
                        />
                        {newContact.emails.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger border-secondary"
                            onClick={() => removeEmailField(index)}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-link text-primary text-decoration-none p-0"
                    onClick={addEmailField}
                  >
                    <Plus size={16} className="me-1" /> Add Email Address
                  </button>
                </div>
                <div className="mb-3">
                  <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1">
                    Phone Numbers
                  </label>
                  {newContact.phones.map((phone, index) => (
                    <div key={index} className="d-flex gap-2 mb-2 flex-wrap">
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        style={{ width: "120px", flexShrink: 0 }}
                        value={phone.label}
                        onChange={(e) =>
                          handlePhoneChange(index, "label", e.target.value)
                        }
                      >
                        <option value="work">Work</option>
                        <option value="mobile">Mobile</option>
                        <option value="home">Home</option>
                      </select>
                      <div className="input-group flex-grow-1">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          <Phone size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-start-0"
                          placeholder="0300-1234567"
                          value={phone.value}
                          onChange={(e) =>
                            handlePhoneChange(index, "value", e.target.value)
                          }
                        />
                        {newContact.phones.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger border-secondary"
                            onClick={() => removePhoneField(index)}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-link text-primary text-decoration-none p-0"
                    onClick={addPhoneField}
                  >
                    <Plus size={16} className="me-1" /> Add Phone Number
                  </button>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-3 p-4 border-top border-secondary flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* EDIT CONTACT MODAL */}
      {/* ============================================ */}
      {showEditModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeEditModal}
          onKeyDown={(e) => handleModalKeyDown(e, closeEditModal)}
        >
          <div
            ref={editModalRef}
            className="bg-dark rounded-4 border border-secondary"
            style={{
              maxWidth: "560px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              margin: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="bg-primary rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px" }}
                >
                  <Edit size={22} className="text-white" />
                </div>
                <div>
                  <h5 id="edit-modal-title" className="text-white fw-bold mb-0">
                    Edit Contact Profile
                  </h5>
                  <p className="text-light opacity-75 small mb-0">
                    Update the contact information below.
                  </p>
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                onClick={closeEditModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-4">
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label
                      htmlFor="edit-firstName"
                      className="text-light opacity-75 small fw-semibold text-uppercase mb-1"
                    >
                      First Name
                    </label>
                    <input
                      id="edit-firstName"
                      type="text"
                      name="firstName"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. Ahmed"
                      value={editContact.firstName}
                      onChange={handleEditChange}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="col-6">
                    <label
                      htmlFor="edit-lastName"
                      className="text-light opacity-75 small fw-semibold text-uppercase mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      id="edit-lastName"
                      type="text"
                      name="lastName"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. Khan"
                      value={editContact.lastName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="edit-title"
                    className="text-light opacity-75 small fw-semibold text-uppercase mb-1"
                  >
                    Title
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <Briefcase size={18} />
                    </span>
                    <input
                      id="edit-title"
                      type="text"
                      name="title"
                      className="form-control bg-dark text-white border-secondary border-start-0"
                      placeholder="e.g. Software Engineer"
                      value={editContact.title}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1">
                    Email Addresses
                  </label>
                  {editContact.emails.map((email, index) => (
                    <div key={index} className="d-flex gap-2 mb-2 flex-wrap">
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        style={{ width: "120px", flexShrink: 0 }}
                        value={email.label}
                        onChange={(e) =>
                          handleEditEmailChange(index, "label", e.target.value)
                        }
                      >
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="input-group flex-grow-1">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="form-control bg-dark text-white border-secondary border-start-0"
                          placeholder="ahmed.khan@email.com"
                          value={email.value}
                          onChange={(e) =>
                            handleEditEmailChange(
                              index,
                              "value",
                              e.target.value,
                            )
                          }
                        />
                        {editContact.emails.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger border-secondary"
                            onClick={() => removeEditEmailField(index)}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-link text-primary text-decoration-none p-0"
                    onClick={addEditEmailField}
                  >
                    <Plus size={16} className="me-1" /> Add Email Address
                  </button>
                </div>
                <div className="mb-3">
                  <label className="text-light opacity-75 small fw-semibold text-uppercase mb-1">
                    Phone Numbers
                  </label>
                  {editContact.phones.map((phone, index) => (
                    <div key={index} className="d-flex gap-2 mb-2 flex-wrap">
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        style={{ width: "120px", flexShrink: 0 }}
                        value={phone.label}
                        onChange={(e) =>
                          handleEditPhoneChange(index, "label", e.target.value)
                        }
                      >
                        <option value="work">Work</option>
                        <option value="mobile">Mobile</option>
                        <option value="home">Home</option>
                      </select>
                      <div className="input-group flex-grow-1">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          <Phone size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary border-start-0"
                          placeholder="0300-1234567"
                          value={phone.value}
                          onChange={(e) =>
                            handleEditPhoneChange(
                              index,
                              "value",
                              e.target.value,
                            )
                          }
                        />
                        {editContact.phones.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger border-secondary"
                            onClick={() => removeEditPhoneField(index)}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-link text-primary text-decoration-none p-0"
                    onClick={addEditPhoneField}
                  >
                    <Plus size={16} className="me-1" /> Add Phone Number
                  </button>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-3 p-4 border-top border-secondary flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================ */}
      {showDeleteModal && deletingContact && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeDeleteModal}
          onKeyDown={(e) => handleModalKeyDown(e, closeDeleteModal)}
        >
          <div
            ref={deleteModalRef}
            className="bg-dark rounded-4 border border-secondary"
            style={{ maxWidth: "480px", width: "100%", margin: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4" style={{ borderTop: "4px solid #dc3545" }}>
              <div className="d-flex gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(220, 53, 69, 0.15)",
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={20} className="text-danger" />
                </div>
                <div className="flex-grow-1">
                  <h5
                    id="delete-modal-title"
                    className="text-white fw-bold mb-1"
                  >
                    Delete contact?
                  </h5>
                  <p className="text-light opacity-75 small mb-0">
                    Are you sure you want to delete this contact? This action
                    cannot be undone.
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                  onClick={closeDeleteModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="bg-dark bg-opacity-50 rounded-3 p-3 d-flex align-items-center gap-3 border border-secondary">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: deletingContact.color || "#0052cc",
                    fontSize: "14px",
                  }}
                >
                  {deletingContact.avatar ||
                    getInitials(
                      deletingContact.firstName,
                      deletingContact.lastName,
                    )}
                </div>
                <div>
                  <div className="text-white fw-semibold">
                    {deletingContact.firstName} {deletingContact.lastName}
                  </div>
                  <div className="text-light opacity-75 small">
                    {getContactEmail(deletingContact)}
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-3 p-4 border-top border-secondary flex-wrap">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closeDeleteModal}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
              >
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* VIEW CONTACT MODAL */}
      {/* ============================================ */}
      {showViewModal && viewingContact && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-modal-title"
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeViewModal}
          onKeyDown={(e) => handleModalKeyDown(e, closeViewModal)}
        >
          <div
            ref={viewModalRef}
            className="bg-dark rounded-4 border border-secondary"
            style={{
              maxWidth: "540px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              margin: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary">
              <h5 id="view-modal-title" className="text-white fw-bold mb-0">
                Contact Information
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                onClick={closeViewModal}
                aria-label="Close modal"
                autoFocus
              >
                <X size={20} />
              </button>
            </div>
            {/* View modal content - same as before */}
            <div className="text-center p-4">
              <div className="position-relative d-inline-block">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{
                    width: "110px",
                    height: "110px",
                    backgroundColor: viewingContact.color || "#0052cc",
                    fontSize: "32px",
                    border: "3px solid #1a1a2e",
                  }}
                >
                  {viewingContact.avatar ||
                    getInitials(
                      viewingContact.firstName,
                      viewingContact.lastName,
                    )}
                </div>
                <span
                  className="position-absolute bottom-0 end-0 rounded-circle border border-dark"
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: "#22c55e",
                    borderWidth: "3px",
                  }}
                ></span>
              </div>
              <h2 className="text-white fw-bold mt-3 mb-1">
                {viewingContact.firstName} {viewingContact.lastName}
              </h2>
              <p className="text-primary fw-medium">{viewingContact.title}</p>
            </div>
            <div className="px-4 pb-4">
              <hr className="border-secondary" />
              <div className="mb-3">
                <h6 className="text-secondary text-uppercase small fw-bold mb-2">
                  Email Addresses
                </h6>
                {(
                  viewingContact.emails || [
                    { label: "work", value: getContactEmail(viewingContact) },
                  ]
                ).map((email, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-25"
                  >
                    <div>
                      <div className="text-secondary text-uppercase small fw-bold">
                        {email.label}
                      </div>
                      <div className="text-white">{email.value}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                      onClick={() =>
                        copyToClipboard(email.value, `${email.label} email`)
                      }
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <h6 className="text-secondary text-uppercase small fw-bold mb-2">
                  Phone Numbers
                </h6>
                {(
                  viewingContact.phones || [
                    { label: "work", value: getContactPhone(viewingContact) },
                  ]
                ).map((phone, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-25"
                  >
                    <div>
                      <div className="text-secondary text-uppercase small fw-bold">
                        {phone.label}
                      </div>
                      <div className="text-white">{phone.value}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                      onClick={() =>
                        copyToClipboard(phone.value, `${phone.label} phone`)
                      }
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="d-flex justify-content-end gap-3 p-4 border-top border-secondary flex-wrap">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closeViewModal}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  closeViewModal();
                  openEditModal(viewingContact);
                }}
              >
                <Edit size={16} className="me-1" /> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* LOGOUT CONFIRMATION MODAL */}
      {/* ============================================ */}
      {showLogoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeLogoutModal}
          onKeyDown={(e) => handleModalKeyDown(e, closeLogoutModal)}
        >
          <div
            ref={logoutModalRef}
            className="bg-dark rounded-4 border border-secondary p-4 text-center position-relative"
            style={{ maxWidth: "460px", width: "100%", margin: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-sm btn-outline-secondary border-0 text-secondary position-absolute"
              onClick={closeLogoutModal}
              style={{ top: "20px", right: "20px" }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "rgba(220, 53, 69, 0.15)",
              }}
            >
              <LogOut size={24} className="text-danger" />
            </div>
            <h4 id="logout-modal-title" className="fw-bold text-white mb-2">
              Log Out
            </h4>
            <p className="text-light opacity-75 small mb-4">
              Are you sure you want to log out of your account?
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={closeLogoutModal}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4">
        <small className="text-light opacity-50">
          © 2026 EMAZ CMS Systems Inc. All rights reserved.
        </small>
      </footer>
    </div>
  );
};

export default ContactsPage;
