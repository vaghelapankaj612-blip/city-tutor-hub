

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../services/adminApi";

export default function AdminTutors() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setErr("");
    try {
      setLoading(true);
      const data = await adminApi.tutors();
      setRows(data || []);
    } catch (e) {
      setErr(e.message || "Failed to load tutors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((u) => {
      const full = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();

      const subjectsText = Array.isArray(u.subjects)
        ? u.subjects
            .map((sub) => (typeof sub === "string" ? sub : sub.name || ""))
            .join(" ")
            .toLowerCase()
        : "";

      return (
        full.includes(s) ||
        String(u.email || "").toLowerCase().includes(s) ||
        String(u.mobile || "").toLowerCase().includes(s) ||
        subjectsText.includes(s)
      );
    });
  }, [rows, q]);

  const onDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this tutor?");
    if (!ok) return;

    setErr("");
    try {
      await adminApi.deleteTutor(id);
      await load();
    } catch (e) {
      setErr(e.message || "Failed to delete tutor");
    }
  };

  return (
    <AdminLayout title="Tutors" subtitle="Tutor accounts overview">
      {err ? <div className="alert">{err}</div> : null}

      <div className="admin-table-wrap">
        <div className="admin-table-head" style={{ gap: 12 }}>
          <div style={{ fontWeight: 900 }}>All Tutors</div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              className="admin-search"
              placeholder="Search name / email / mobile / subject..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <button className="admin-btn primary" onClick={() => nav("/admin/tutors/add")}>
              ➕ Add Tutor
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 16, color: "#64748b" }}>Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>MOBILE</th>
                <th>SUBJECTS</th>
                <th>ROLE</th>
                <th>CREATED</th>
                <th style={{ width: 180 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || "-"}</td>
                  <td>{u.email || "-"}</td>
                  <td>{u.mobile || "-"}</td>
                  <td>
                    {Array.isArray(u.subjects) && u.subjects.length > 0
                      ? u.subjects
                          .map((sub) => (typeof sub === "string" ? sub : sub.name || "-"))
                          .join(", ")
                      : "-"}
                  </td>
                  <td>
                    <span className="badge info">tutor</span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="admin-btn ghost"
                        onClick={() => nav(`/admin/tutors/${u._id}/edit`)}
                      >
                        ✏️ Edit
                      </button>

                      <button className="admin-btn danger" onClick={() => onDelete(u._id)}>
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 18, color: "rgba(255,255,255,.65)" }}>
                    No tutors found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}