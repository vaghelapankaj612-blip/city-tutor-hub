import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../services/adminApi";

export default function AdminTutorEdit() {
  const nav = useNavigate();
  const { id } = useParams();

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    mobile: "",
    email: "",
    age: "",

    subjects: "",

    startHour: "10:00",
    endHour: "18:00",
    slotDuration: 2,

    active: true,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const hourToTimeString = (hour) => {
    const h = Number(hour ?? 0);
    return `${String(h).padStart(2, "0")}:00`;
  };

  const convertTimeToHour = (timeStr) => {
    if (!timeStr) return 0;
    const [hour] = timeStr.split(":").map(Number);
    return hour;
  };

  const load = async () => {
    setErr("");
    try {
      setLoading(true);

      const list = await adminApi.tutors();
      const t = (list || []).find((x) => String(x._id) === String(id));
      if (!t) throw new Error("Tutor not found");

      setForm({
        firstName: t.firstName || "",
        lastName: t.lastName || "",
        gender: t.gender || "",
        mobile: t.mobile || "",
        email: t.email || "",
        age: t.age ?? "",

        subjects: Array.isArray(t.subjects) ? t.subjects.join(", ") : "",

        startHour: hourToTimeString(t.availability?.startHour ?? 10),
        endHour: hourToTimeString(t.availability?.endHour ?? 18),
        slotDuration: t.availability?.slotDuration ?? 2,

        active: t.active ?? true,
      });
    } catch (e) {
      setErr(e.message || "Failed to load tutor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const startHourNumber = convertTimeToHour(form.startHour);
    const endHourNumber = convertTimeToHour(form.endHour);

    if (startHourNumber >= endHourNumber) {
      return setErr("Start Time must be less than End Time");
    }
    if (Number(form.slotDuration) <= 0) {
      return setErr("Slot Duration must be greater than 0");
    }

    try {
      await adminApi.updateTutor(id, {
        firstName: form.firstName,
        lastName: form.lastName,
        gender: form.gender,
        mobile: form.mobile,
        email: form.email,
        age: form.age,

        subjects: form.subjects,

        availability: {
          startHour: startHourNumber,
          endHour: endHourNumber,
          slotDuration: Number(form.slotDuration),
        },

        active: form.active,
      });

      nav("/admin/tutors");
    } catch (e2) {
      setErr(e2.message || "Update failed");
    }
  };

  return (
    <AdminLayout showSidebar={false} hideTopbar={true}>
      <div className="admin-section-head">
        <div className="admin-section-left">
          <span className="admin-section-icon">✏️</span>
          <div>
            <div className="admin-section-title">Edit Tutor</div>
            <div className="admin-section-sub">Update tutor details & availability</div>
          </div>
        </div>

        <div className="admin-section-right">
          <button className="admin-btn ghost" onClick={() => nav("/admin/tutors")}>
            ← Back
          </button>
        </div>
      </div>

      {err ? <div className="alert">{err}</div> : null}

      <div className="admin-form-card">
        {loading ? (
          <div style={{ padding: 16, color: "#64748b" }}>Loading...</div>
        ) : (
          <form onSubmit={submit}>
            <div className="grid-2">
              <input
                className="admin-input"
                placeholder="First Name *"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                required
              />
              <input
                className="admin-input"
                placeholder="Last Name *"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                required
              />

              <input
                className="admin-input"
                placeholder="Phone *"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
                required
              />
              <input
                className="admin-input"
                placeholder="Email *"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />

              <select
                className="admin-input"
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                required
              >
                <option value="" disabled>
                  Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                className="admin-input"
                placeholder="Age *"
                type="number"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                required
              />

              <input
                className="admin-input"
                placeholder="Subjects/Courses (comma separated)"
                value={form.subjects}
                onChange={(e) => set("subjects", e.target.value)}
              />
              <div />
            </div>

            <div style={{ marginTop: 14, fontWeight: 900 }}>Tutor Availability</div>
            <div className="grid-2" style={{ marginTop: 10 }}>
              <div>
                <div style={{ marginBottom: 6, fontWeight: 700 }}>Start Time</div>
                <input
                  className="admin-input"
                  type="time"
                  value={form.startHour}
                  onChange={(e) => set("startHour", e.target.value)}
                  required
                />
              </div>

              <div>
                <div style={{ marginBottom: 6, fontWeight: 700 }}>End Time</div>
                <input
                  className="admin-input"
                  type="time"
                  value={form.endHour}
                  onChange={(e) => set("endHour", e.target.value)}
                  required
                />
              </div>

              <div>
                <div style={{ marginBottom: 6, fontWeight: 700 }}>
                  Lecture Duration (e.g. 2 hours)
                </div>
                <input
                  className="admin-input"
                  type="number"
                  placeholder="2 hour lecture"
                  value={form.slotDuration}
                  onChange={(e) => set("slotDuration", e.target.value)}
                  min={1}
                  max={8}
                  required
                />
              </div>

              <div />
            </div>

            <div className="form-footer">
              <label className="switch-row">
                <span className="switch-label">Active</span>
                <span
                  className={`switch ${form.active ? "on" : ""}`}
                  onClick={() => set("active", !form.active)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="knob" />
                </span>
              </label>

              <button className="admin-btn primary" type="submit">
                Update
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
