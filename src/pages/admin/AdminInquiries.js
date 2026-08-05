import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../services/adminApi";
import Modal from "../../components/admin/Modal";

export default function AdminInquiries() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setErr("");
      const data = await adminApi.inquiries();
      setRows(data || []);
    } catch (e) {
      setErr(e.message);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleRefresh = () => {
    fetchInquiries();
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((x) => {
      const msg = String(x.message || x.inquiry || "").toLowerCase();
      return (
        String(x.name || "").toLowerCase().includes(s) ||
        String(x.email || "").toLowerCase().includes(s) ||
        msg.includes(s)
      );
    });
  }, [rows, q]);

  return (
    <AdminLayout title="Inquiries" subtitle="Manage user inquiries" showSidebar={true}>
      
      {/* HEADER BAR */}
      <div className="pagebar inquiry-bar">

        {/* LEFT */}
        <button
          className="pagebar-btn"
          onClick={() => navigate("/admin")}
        >
          ← Dashboard
        </button>

        {/* CENTER */}
        <div className="pagebar-title">
          <span className="pagebar-icon">📩</span>
          Inquiries
        </div>

        {/* RIGHT */}
        <button className="pagebar-btn" onClick={handleRefresh}>
          🔄 Refresh
        </button>

      </div>

      {err ? <div className="alert">{err}</div> : null}

      <div className="admin-table-wrap">
        <div className="admin-table-head">
          <div style={{ fontWeight: 900 }}>All Inquiries</div>

          <input
            className="admin-search"
            placeholder="Search name / email / message..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>MESSAGE (preview)</th>
              <th>CREATED</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((x) => (
              <tr
                key={x._id}
                onClick={() => setSelected(x)}
                style={{ cursor: "pointer" }}
                title="Click to view full message"
              >
                <td>{x.name || "-"}</td>
                <td>{x.email || "-"}</td>

                <td
                  style={{
                    maxWidth: 520,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {x.message || x.inquiry || "-"}
                </td>

                <td>
                  {x.createdAt
                    ? new Date(x.createdAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 18, color: "#64748b" }}>
                  No inquiries found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!selected}
        title="Inquiry Details"
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
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        }
      >
        {selected ? (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Name</div>
              <div className="detail-value">{selected.name || "-"}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{selected.email || "-"}</div>
            </div>

            <div className="detail-item detail-wide">
              <div className="detail-label">Full Message</div>
              <div className="detail-value" style={{ fontWeight: 700 }}>
                {selected.message || selected.inquiry || "-"}
              </div>
            </div>

            <div className="detail-item detail-wide">
              <div className="detail-label">Created</div>
              <div className="detail-value">
                {selected.createdAt
                  ? new Date(selected.createdAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}