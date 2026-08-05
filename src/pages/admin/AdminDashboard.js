import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../services/adminApi";

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [err, setErr] = useState("");

  const [stats, setStats] = useState({
    users: 0,
    tutors: 0,
    appointments: 0,
    inquiries: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const s = await adminApi.stats();
setStats({
  users: Number(s?.users) || 0,
  tutors: Number(s?.tutors) || 0,
  appointments: Number(s?.appointments ?? s?.bookings) || 0,
  inquiries: Number(s?.inquiries) || 0,
});
      } catch (e) {
        setErr(e.message || "Failed to load dashboard");
      }
    })();
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Real-time admin overview"
      showSidebar={true}
      sidebarDefaultOpen={true} // ✅ Dashboard open sidebar
    >
      {err ? <div className="alert">{err}</div> : null}

      <div className="admin-grid">
        <StatCard title="Total Users" value={stats.users} icon="👥" />
        <StatCard title="Total Tutors" value={stats.tutors} icon="🎓" />
        <StatCard title="Appointments" value={stats.appointments} icon="📋" />
      </div>

      <div className="quick-card">
        <div className="quick-title">Quick Actions</div>

        <div className="quick-row">
          <button className="quick-btn" onClick={() => nav("/admin/users")}>
            👥 Manage Users
          </button>

          <button className="quick-btn gray" onClick={() => nav("/admin/tutors")}>
            🎓 Manage Tutors
          </button>

          <button className="quick-btn cyan" onClick={() => nav("/admin/appointments")}>
            📅 Manage Appointments
          </button>

          <button className="quick-btn green" onClick={() => nav("/admin/inquiries")}>
            ✉️ View Inquiries ({stats.inquiries})
          </button>
          <button className="quick-btn green" onClick={() => nav("/admin/tutor-appointments")}>
  ✅ Tutor Appointments
</button>
        </div>
      </div>
    </AdminLayout>
  );
}