import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../services/adminApi";

function formatDate(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleString();
  } catch {
    return "-";
  }
}

export default function AdminUsers() {
  const nav = useNavigate();

  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await adminApi.users();
        setUsers(list || []);
      } catch (e) {
        setErr(e.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;

    return users.filter((u) => {
      const name =
        `${u.firstName || ""} ${u.lastName || ""}`.trim().toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const mobile = String(u.mobile || "").toLowerCase();
      return name.includes(s) || email.includes(s) || mobile.includes(s);
    });
  }, [users, q]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    window.location.href = "/admin/login";
  };

  return (
  <AdminLayout
  title="Users"
  subtitle="Manage registered users"
  showSidebar={true}
>
      {/* ✅ Dark top strip like screenshot */}
      <div className="pagebar">
        <button className="pagebar-btn" onClick={() => nav("/admin")}>
          ← Back to Dashboard
        </button>

        <div className="pagebar-title">
          <span className="pagebar-icon">👥</span> Users
        </div>

        <div className="pagebar-right">
          <button className="pagebar-btn" onClick={() => nav("/admin/appointments")}>
            Appointments
          </button>
          <button className="pagebar-btn danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="page-wrap">
        <div className="page-head">
          <div>
            <div className="page-h1">All Registered Users</div>
            <div className="page-sub">Total: {filtered.length}</div>
          </div>

          <input
            className="page-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / email / contact..."
          />
        </div>

        {err ? <div className="alert">{err}</div> : null}

        <div className="page-table-wrap">
          <table className="page-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Name</th>
                <th>Email</th>
                <th style={{ width: 170 }}>Contact</th>
                <th style={{ width: 110 }}>Gender</th>
                <th style={{ width: 80 }}>Age</th>
                <th style={{ width: 220 }}>Created</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 18, color: "#64748b" }}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 18, color: "#64748b" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr key={u._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || "-"}</td>
                    <td>{u.email || "-"}</td>
                    <td>{u.mobile || "-"}</td>
                    <td style={{ textTransform: "capitalize" }}>{u.gender || "-"}</td>
                    <td>{u.age ?? "-"}</td>
                    <td>{formatDate(u.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}