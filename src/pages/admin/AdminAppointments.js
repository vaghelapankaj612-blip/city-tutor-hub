import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../services/adminApi";
import Modal from "../../components/admin/Modal";

function statusBadge(status) {
  const s = String(status || "").toLowerCase();

  if (s === "completed") return "badge success";
  if (s === "cancelled") return "badge danger";
  if (s === "started") return "badge warning";

  return "badge info";
}

function formatTime12Hour(time) {
  if (!time) return "-";

  const raw = String(time).trim();

  if (raw.toUpperCase().includes("AM") || raw.toUpperCase().includes("PM")) {
    return raw;
  }

  const [hStr, mStr = "00"] = raw.split(":");
  let hour = Number(hStr);

  if (Number.isNaN(hour)) return raw;

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${mStr} ${ampm}`;
}

export default function AdminAppointments() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setErr("");
    try {
      const data = await adminApi.appointments();
      setRows(data || []);
    } catch (e) {
      setErr(e.message || "Failed to load appointments");
    }
  };

  useEffect(() => {
    load();

    const timer = setInterval(() => {
      load();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return rows.filter((b) => {
      const matchesSearch =
        !s ||
        String(b.name || "").toLowerCase().includes(s) ||
        String(b.email || "").toLowerCase().includes(s) ||
        String(b.subject || "").toLowerCase().includes(s) ||
        String(b.tutor || "").toLowerCase().includes(s) ||
        String(b.date || "").toLowerCase().includes(s) ||
        String(b.status || "").toLowerCase().includes(s);

      const matchesStatus =
        status === "all" ? true : String(b.status || "").toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });
  }, [rows, q, status]);

  return (
    <AdminLayout
      title="Appointments"
      subtitle="Manage all booked appointments"
      showSidebar={true}
    >
      {err ? <div className="alert">{err}</div> : null}

      <div className="admin-dark-header">
        <div className="admin-dark-left">
          <button
            className="admin-dark-btn"
            onClick={() => {
              window.location.href = "/admin";
            }}
          >
            ← Dashboard
          </button>

          <div className="admin-dark-title">📅 Appointments</div>
        </div>

        <div className="admin-dark-right">
          <button
            className="admin-dark-btn"
            onClick={() => {
              window.location.href = "/admin/users";
            }}
          >
            Users
          </button>

          <button
            className="admin-dark-btn"
            onClick={() => {
              load();
            }}
          >
            Refresh
          </button>

          <button
            className="admin-dark-btn danger"
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("admin");
              window.location.href = "/admin/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-head" style={{ gap: 12 }}>
          <div style={{ fontWeight: 900 }}>All Appointments</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              className="admin-search"
              style={{ width: 180 }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="booked">Booked</option>
              <option value="started">Started</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              className="admin-search"
              placeholder="Search name / email / tutor / subject / date..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>EMAIL</th>
              <th>SUBJECT</th>
              <th>TUTOR</th>
              <th>DATE</th>
              <th>TIME</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((b) => {
              const st = String(b.status || "booked").toLowerCase();

              return (
                <tr
                  key={b._id}
                  onClick={() => setSelected(b)}
                  style={{ cursor: "pointer" }}
                  title="Click to view full details"
                >
                  <td>{b.name || "-"}</td>
                  <td>{b.email || "-"}</td>
                  <td>{b.subject || "-"}</td>
                  <td>{b.tutor || "-"}</td>
                  <td>{b.date || "-"}</td>
                  <td>
                    {formatTime12Hour(b.startTime)} - {formatTime12Hour(b.endTime)}
                  </td>
                  <td>
                    <span className={statusBadge(st)}>{st}</span>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: 18, color: "rgba(255,255,255,.65)" }}>
                  No appointments found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!selected}
        title="Appointment Details"
        onClose={() => setSelected(null)}
        footer={
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <button className="modal-close" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        }
      >
        {selected ? (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Student Name</div>
              <div className="detail-value">{selected.name || "-"}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Student Email</div>
              <div className="detail-value">{selected.email || "-"}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Subject</div>
              <div className="detail-value">{selected.subject || "-"}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Tutor</div>
              <div className="detail-value">{selected.tutor || "-"}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Date</div>
              <div className="detail-value">{selected.date || "-"}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Time</div>
              <div className="detail-value">
                {formatTime12Hour(selected.startTime)} -{" "}
                {formatTime12Hour(selected.endTime)}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <span className={statusBadge(selected.status)}>
                  {selected.status || "booked"}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Created</div>
              <div className="detail-value">
                {selected.createdAt
                  ? new Date(selected.createdAt).toLocaleString()
                  : "-"}
              </div>
            </div>

            <div className="detail-item detail-wide">
              <div className="detail-label">Tokens</div>
              <div
                className="detail-value"
                style={{ fontWeight: 700, color: "rgba(255,255,255,.75)" }}
              >
                cancelToken: {selected.cancelToken || "-"} <br />
                rescheduleToken: {selected.rescheduleToken || "-"}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}