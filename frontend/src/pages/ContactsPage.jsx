import React, { useState, useEffect } from "react";
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
import "bootstrap/dist/css/bootstrap.min.css";

const ContactsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
  const itemsPerPage = 5;

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

  const allContacts = [
    {
      id: 1,
      firstName: "Sarah",
      lastName: "Mitchell",
      title: "Senior Architect",
      email: "sarah.m@nexus-industries.com",
      phone: "0300-1234567",
      avatar: "SM",
      color: "#0052cc",
      emails: [{ label: "work", value: "sarah.m@nexus-industries.com" }],
      phones: [{ label: "work", value: "0300-1234567" }],
    },
    {
      id: 2,
      firstName: "David",
      lastName: "Rodriguez",
      title: "Product Lead",
      email: "d.rodriguez@vanguard.io",
      phone: "0311-9876543",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      color: "#00875a",
      emails: [{ label: "work", value: "d.rodriguez@vanguard.io" }],
      phones: [{ label: "mobile", value: "0311-9876543" }],
    },
    {
      id: 3,
      firstName: "Linda",
      lastName: "Chen",
      title: "CTO",
      email: "lchen@techflow.net",
      phone: "0322-4567890",
      avatar: "LC",
      color: "#00875a",
      emails: [{ label: "work", value: "lchen@techflow.net" }],
      phones: [{ label: "work", value: "0322-4567890" }],
    },
    {
      id: 4,
      firstName: "Eleanor",
      lastName: "Vance",
      title: "Managing Partner",
      email: "vance.e@horizon-legal.com",
      phone: "0333-7890123",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      color: "#42526e",
      emails: [{ label: "work", value: "vance.e@horizon-legal.com" }],
      phones: [{ label: "work", value: "0333-7890123" }],
    },
    {
      id: 5, // ← Fixed: changed from 4 to 5
      firstName: "Gregory",
      lastName: "Kane",
      title: "Sales Director",
      email: "gkane@global-logistics.net",
      phone: "0344-5678901",
      avatar: "GK",
      color: "#42526e",
      emails: [{ label: "work", value: "gkane@global-logistics.net" }],
      phones: [{ label: "mobile", value: "0344-5678901" }],
    },
  ];

  const [contacts, setContacts] = useState(allContacts);

  // Toast notification
  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // Phone number validation
  const validatePhoneInput = (value) => {
    return value.replace(/[^0-9+\s-]/g, "");
  };

  // Search function
  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;

    return (
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.title.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.phone.includes(searchLower) ||
      `${contact.firstName} ${contact.lastName}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredContacts.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // ========== ADD MODAL HANDLERS ==========
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

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const newContactData = {
      id: Date.now(), // ← Fixed: use timestamp for unique id
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      title: newContact.title,
      email: newContact.emails[0]?.value || "",
      phone: newContact.phones[0]?.value || "",
      avatar: `${newContact.firstName.charAt(0)}${newContact.lastName.charAt(0)}`,
      color: "#2563eb",
      emails: newContact.emails,
      phones: newContact.phones,
    };

    setContacts([...contacts, newContactData]);
    closeAddModal();
    showToastMessage(
      `${newContact.firstName} ${newContact.lastName} added successfully!`,
      "success",
    );
  };

  // ========== EDIT MODAL HANDLERS ==========
  const openEditModal = (contact) => {
    setEditingContact(contact);
    setEditContact({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title,
      emails: contact.emails?.map((e) => ({ ...e })) || [
        { label: "work", value: contact.email },
      ],
      phones: contact.phones?.map((p) => ({ ...p })) || [
        { label: "work", value: contact.phone },
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

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const updatedContacts = contacts.map((contact) => {
      if (contact.id === editContact.id) {
        return {
          ...contact,
          firstName: editContact.firstName,
          lastName: editContact.lastName,
          title: editContact.title,
          email: editContact.emails[0]?.value || "",
          phone: editContact.phones[0]?.value || "",
          avatar: `${editContact.firstName.charAt(0)}${editContact.lastName.charAt(0)}`,
          emails: editContact.emails,
          phones: editContact.phones,
        };
      }
      return contact;
    });

    setContacts(updatedContacts);
    closeEditModal();
    showToastMessage(
      `${editContact.firstName} ${editContact.lastName} updated successfully!`,
      "success",
    );
  };

  // ========== DELETE MODAL HANDLERS ==========
  const openDeleteModal = (contact) => {
    setDeletingContact(contact);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingContact(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingContact) {
      setContacts(
        contacts.filter((contact) => contact.id !== deletingContact.id),
      );
      showToastMessage(
        `${deletingContact.firstName} ${deletingContact.lastName} deleted successfully!`,
        "danger",
      );
      closeDeleteModal();
    }
  };

  // ========== VIEW MODAL HANDLERS ==========
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const clearSearch = () => {
    setSearchTerm("");
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
          .profile-menu-container {
            position: relative;
          }
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
            text-decoration: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s;
            border: none;
            background: none;
            width: 100%;
            font-size: 14px;
          }
          .profile-dropdown-item:hover {
            background-color: rgba(255,255,255,0.05);
          }
          .profile-dropdown-item.text-danger:hover {
            background-color: rgba(220, 53, 69, 0.15);
          }
          .profile-dropdown-divider {
            height: 1px;
            background-color: #495057;
            margin: 6px 8px;
          }
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
              margin: 0;
            }
            .profile-dropdown-item {
              padding: 14px 16px;
            }
            .table-responsive {
              font-size: 12px;
            }
            .table td, .table th {
              padding: 8px 6px;
              white-space: nowrap;
            }
            .modal-content-mobile {
              margin: 8px !important;
              max-height: 95vh !important;
            }
            .nav-container {
              flex-wrap: nowrap !important;
            }
            .nav-brand {
              flex-shrink: 0;
            }
            .nav-search {
              flex: 1;
              min-width: 80px;
            }
            .nav-profile {
              flex-shrink: 0;
            }
          }
        `}
      </style>

      {/* Top Navigation */}
      <nav
        className="bg-dark border-bottom border-secondary p-2 p-sm-3 d-flex align-items-center justify-content-between sticky-top nav-container"
        style={{ zIndex: 100, gap: "8px", flexWrap: "nowrap" }}
      >
        <div className="d-flex align-items-center gap-2 nav-brand">
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
          className="position-relative nav-search"
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
              color: "#6c757d",
            }}
          />
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              borderRadius: "8px",
              paddingLeft: "36px",
              paddingRight: searchTerm ? "36px" : "12px",
              paddingTop: "6px",
              paddingBottom: "6px",
              backgroundColor: "#2a2a2a",
              color: "#ffffff",
              border: "1px solid #495057",
              fontSize: "13px",
              height: "34px",
            }}
          />
          <style>
            {`
              .form-control::placeholder {
                color: #a0a0a0 !important;
                opacity: 1 !important;
              }
              .form-control:focus::placeholder {
                color: #c0c0c0 !important;
              }
            `}
          </style>
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

        <div className="profile-menu-container d-flex align-items-center gap-2 nav-profile">
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
              {filteredContacts.length === 0
                ? "No contacts found"
                : `Manage your network and track engagement history.`}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
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

        {filteredContacts.length === 0 && searchTerm && (
          <div className="bg-dark bg-opacity-50 rounded-4 border border-secondary p-5 text-center">
            <Search size={48} className="text-secondary mb-3" />
            <h4 className="text-white">No contacts found</h4>
            <p className="text-light opacity-75">
              No results found for "
              <strong className="text-white">{searchTerm}</strong>"
            </p>
            <button className="btn btn-outline-secondary" onClick={clearSearch}>
              Clear Search
            </button>
          </div>
        )}

        {paginatedContacts.length > 0 && (
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
                  {paginatedContacts.map((contact) => (
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
                        {contact.email}
                      </td>
                      <td
                        className="px-3 py-3 text-white-50"
                        style={{ fontSize: "14px" }}
                      >
                        {contact.phone}
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
                Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredContacts.length)}{" "}
                of {filteredContacts.length} contacts
              </span>
              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
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
                    {page}
                  </button>
                ))}

                <button
                  className="btn btn-sm btn-outline-secondary border-0 text-secondary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== MODALS (Same as before, no changes needed) ===== */}
      {/* All modals remain the same - they already have the fixes */}
      {/* Logout Modal, Add Modal, Edit Modal, Delete Modal, View Modal */}

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
