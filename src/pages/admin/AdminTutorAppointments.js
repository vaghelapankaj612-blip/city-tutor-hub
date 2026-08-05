import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../services/adminApi";

export default function AdminTutorAppointments() {
  const nav = useNavigate();

  const [tutors, setTutors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setErr("");
    try {
      setLoading(true);

      const [tList, aList] = await Promise.all([
        adminApi.tutors(),
        adminApi.appointments(),
      ]);

      const t = tList || [];
      const a = aList || [];

      setTutors(t);
      setAppointments(a);

      // default select first tutor
      if (!selectedTutor && t.length) {
        const first = `${t[0].firstName || ""} ${t[0].lastName || ""}`.trim();
        setSelectedTutor(first);
      }
    } catch (e) {
      setErr(e.message || "Failed to load tutor appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tutorOptions = useMemo(() => {
    return (tutors || []).map((t) => {
      const name = `${t.firstName || ""} ${t.lastName || ""}`.trim();
      return { id: t._id, name, dept: t.department || "Tutor" };
    });
  }, [tutors]);

  const filtered = useMemo(() => {
    const pick = String(selectedTutor || "").trim().toLowerCase();
    if (!pick) return [];
    return (appointments || []).filter((a) =>
      String(a.tutor || "").toLowerCase().includes(pick)
    );
  }, [appointments, selectedTutor]);

  return (
    <AdminLayout showSidebar={true} hideTopbar={false}>
      {/* ✅ Header like screenshot */}
      <div className="admin-section-head">
        <div className="admin-section-left">
          <span className="admin-section-icon">🧑‍🏫</span>
          <div>
            <div className="admin-section-title">Tutor Appointments</div>
            <div className="admin-section-sub">
              Select a tutor and view their appointments
            </div>
          </div>
        </div>

        <div className="admin-section-right">
          <button className="admin-btn ghost" onClick={() => nav("/admin")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {err ? <div className="alert">{err}</div> : null}

      {/* ✅ Select Tutor card */}
      <div className="admin-form-card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Select Tutor</div>

        <select
          className="admin-input"
          value={selectedTutor}
          onChange={(e) => setSelectedTutor(e.target.value)}
          disabled={loading}
        >
          {tutorOptions.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name} ({t.dept})
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Appointment list card */}
      <div className="admin-card">
        <div className="admin-card-top" style={{ alignItems: "center" }}>
          <div style={{ color: "#64748b", fontWeight: 800 }}>
            Appointments:{" "}
            <span style={{ color: "#0f172a", fontWeight: 900 }}>
              {selectedTutor || "-"}
            </span>
          </div>

          <span className="count-badge">Total: {filtered.length}</span>
        </div>

        <div className="admin-table-shell">
          <table className="admin-clean-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th style={{ width: 140 }}>Date</th>
                <th style={{ width: 140 }}>Time</th>
                <th style={{ width: 180 }}>Subject</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 18, color: "#64748b" }}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 18, color: "#64748b" }}>
                    No appointments found for this tutor.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 800 }}>{a.name || "-"}</td>
                    <td>{a.email || "-"}</td>
                    <td>{a.date || "-"}</td>
                    <td>{a.startTime ? `${a.startTime} - ${a.endTime || ""}` : "-"}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {a.subject || "-"}
                    </td>
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