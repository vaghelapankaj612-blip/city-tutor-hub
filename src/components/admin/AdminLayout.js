import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  title,
  subtitle,
  children,
  hideTopbar = false,

  // ✅ new
  showSidebar = true,
  sidebarDefaultOpen = false,
}) {
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  return (
    <div className="admin-app">
      <div className="admin-shell">
        {showSidebar ? <AdminSidebar defaultOpen={sidebarDefaultOpen} /> : null}

        <div className={`admin-main ${showSidebar ? "" : "full"}`}>
          {!hideTopbar && (
            <div className="admin-topbar">
              <div>
                <div className="admin-title">{title || "Dashboard"}</div>
                <div className="admin-subtitle">
                  {subtitle || "Admin panel overview"}
                </div>
              </div>

              <div className="admin-welcome">
                Welcome, <strong>{admin?.email ? "Admin" : "Admin"}</strong> 👋
              </div>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}