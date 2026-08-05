import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar({ defaultOpen = false }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    isActive ? "admin-link active" : "admin-link";

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      <div className="admin-brand" onClick={() => setOpen(false)}>
        <div className="admin-brand-badge">CT</div>
        <div>
          <div className="admin-brand-title">City Tutor Hub</div>
          <div className="admin-brand-sub">Admin Dashboard</div>
        </div>
      </div>

      <nav className="admin-nav">
        <div className="admin-menu-label">MENU</div>

        <NavLink to="/admin" end className={linkClass}>
          <span className="admin-link-icon">🏠</span> Dashboard
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <span className="admin-link-icon">👤</span> Users
        </NavLink>

        <NavLink to="/admin/tutors" className={linkClass}>
          <span className="admin-link-icon">🎓</span> Tutors
        </NavLink>

        <NavLink to="/admin/appointments" className={linkClass}>
          <span className="admin-link-icon">📅</span> Appointments
        </NavLink>

        <NavLink to="/admin/inquiries" className={linkClass}>
          <span className="admin-link-icon">✉️</span> Inquiries
        </NavLink>
      </nav>
      <button className="admin-logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}