import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi } from "../../services/adminApi";

export default function AdminTutorAdd() {
  const nav = useNavigate();

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    mobile: "",
    email: "",
    age: "",

    // ✅ NEW
    subjects: "",

    // ✅ NEW availability
    startHour: "10:00",
    endHour: "18:00",
    slotDuration: 2,

    active: true,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const convertTimeToHour = (timeStr) => {
    if (!timeStr) return 0;
    const [hour] = timeStr.split(":").map(Number);
    return hour;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const startHourNumber = convertTimeToHour(form.startHour);
    const endHourNumber = convertTimeToHour(form.endHour);

    // small validation
    if (startHourNumber >= endHourNumber) {
      return setErr("Start Time must be less than End Time");
    }
    if (Number(form.slotDuration) <= 0) {
      return setErr("Slot Duration must be greater than 0");
    }

    try {
      setLoading(true);

await adminApi.addTutor({
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
      setErr(e2.message || "Failed to add tutor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout showSidebar={false} hideTopbar={true}>
      {/* Header */}
      <div className="admin-section-head">
        <div className="admin-section-left">
          <span className="admin-section-icon">➕</span>
          <div className="admin-section-title">Add Tutor</div>
        </div>

        <div className="admin-section-right">
          <button className="admin-btn ghost" onClick={() => nav("/admin/tutors")}>
            Tutors List
          </button>
        </div>
      </div>

      {err ? <div className="alert">{err}</div> : null}

      <div className="admin-form-card">
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
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />

            <input
              className="admin-input"
              placeholder="Phone *"
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)}
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

            {/* ✅ Subjects */}
            <input
              className="admin-input"
              placeholder="Subjects/Courses (comma separated) e.g. maths, science"
              value={form.subjects}
              onChange={(e) => set("subjects", e.target.value)}
            />
          </div>

          {/* ✅ Availability */}
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

            <button className="admin-btn primary" type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Tutor"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

