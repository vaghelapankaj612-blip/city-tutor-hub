import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";


const isSunday = (d) => d && new Date(d).getDay() === 0;

const toDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
};

const formatTime12Hour = (time) => {
  if (!time) return "";
  const [hStr, mStr] = String(time).split(":");
  let hour = Number(hStr);
  const minute = mStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
};

const formatDateNice = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLectureStatus = (booking, tick = Date.now()) => {
  const start = toDateTime(booking?.date, booking?.startTime);
  const end = toDateTime(booking?.date, booking?.endTime);

  if (!start || !end) return "Booked";

  const now = new Date(tick);

  if (now >= end) return "Completed";
  if (now >= start && now < end) return "Started";
  return "Booked";
};

function Profile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("appointments");
  const [me, setMe] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    subject: "",
    tutor: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const token = useMemo(() => localStorage.getItem("token"), []);
  const loggedIn = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (!loggedIn) navigate("/login");
  }, [loggedIn, navigate]);

  const loadMyBookings = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("bookings error:", e);
      setAppointments([]);
    }
  }, [token]);

  useEffect(() => {
    if (!loggedIn) return;

    fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((u) => {
        if (!u?.error) setMe(u);
      })
      .catch((e) => console.error("me error:", e));
  }, [loggedIn, token]);

  useEffect(() => {
    fetch(`${API_BASE}/api/tutors`)
      .then((r) => r.json())
      .then((list) => setTutors(Array.isArray(list) ? list : []))
      .catch((e) => {
        console.error("tutors error:", e);
        setTutors([]);
      });
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    fetch(`${API_BASE}/api/inquiries/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((list) => setInquiries(Array.isArray(list) ? list : []))
      .catch((e) => console.error("inquiries error:", e));
  }, [loggedIn, token]);

  useEffect(() => {
    if (!loggedIn) return;
    loadMyBookings();
  }, [loggedIn, loadMyBookings]);
const [nowTick, setNowTick] = useState(Date.now());
useEffect(() => {
  const timer = setInterval(() => {
    setNowTick(Date.now());
  }, 30000);

  return () => clearInterval(timer);
}, []);

  const fullName = useMemo(() => {
    if (!me) return "";
    return `${me.firstName || ""} ${me.lastName || ""}`.trim();
  }, [me]);

  const selectedTutor = useMemo(() => {
    return tutors.find((t) => {
      const full = `${t.firstName || ""} ${t.lastName || ""}`.trim();
      return full === editForm.tutor;
    });
  }, [tutors, editForm.tutor]);

  const tutorSubjects = useMemo(() => {
    const s = selectedTutor?.subjects;
    if (!s) return [];
    if (Array.isArray(s)) return s.map((x) => String(x).trim()).filter(Boolean);
    return String(s)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [selectedTutor]);

  const tutorAvailability = useMemo(() => {
    const av = selectedTutor?.availability || {};
    return {
      start: Number(av.startHour ?? 10),
      end: Number(av.endHour ?? 18),
      duration: Number(av.slotDuration ?? 2),
    };
  }, [selectedTutor]);

  const openEdit = (b) => {
    setEditing(b);
    setEditForm({
      subject: b.subject || "",
      tutor: b.tutor || "",
      date: b.date || "",
      startTime: b.startTime || "",
      endTime: b.endTime || "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm({
      subject: "",
      tutor: "",
      date: "",
      startTime: "",
      endTime: "",
    });
  };

  const generateTimeSlots = () => {
    if (!editForm.tutor || !editForm.date || isSunday(editForm.date)) return [];

    const { start, end, duration } = tutorAvailability;
    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(duration)) return [];
    if (duration <= 0 || start >= end) return [];

    const slots = [];
    const now = new Date();

    for (let hour = start; hour < end; hour += duration) {
      const slotStart = `${hour.toString().padStart(2, "0")}:00`;
      const slotEndHour = hour + duration;
      if (slotEndHour > end) break;
      const slotEnd = `${slotEndHour.toString().padStart(2, "0")}:00`;

      const slotStartDt = toDateTime(editForm.date, slotStart);

      const isPastSlot = slotStartDt && slotStartDt < now;

      const conflict = appointments.some((x) => {
        if (editing && x._id === editing._id) return false;
        return (
          x.tutor === editForm.tutor &&
          x.date === editForm.date &&
          slotStart < x.endTime &&
          slotEnd > x.startTime
        );
      });

const isCurrentSelected =
  editing &&
  editing.startTime === slotStart &&
  editing.endTime === slotEnd &&
  editing.date === editForm.date &&
  editing.tutor === editForm.tutor;

slots.push({
  start: slotStart,
  end: slotEnd,
  disabled: conflict || isPastSlot || isCurrentSelected,
  isCurrentSelected,
});
    }

    return slots;
  };

  const saveEdit = async () => {
    if (!editing) return;

    if (!editForm.subject || !editForm.tutor || !editForm.date || !editForm.startTime || !editForm.endTime) {
      alert("Please fill all fields.");
      return;
    }

    if (isSunday(editForm.date)) {
      alert("Sunday is a holiday.");
      return;
    }

    try {
      const r = await fetch(`${API_BASE}/api/bookings/${editing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await r.json();
      if (!r.ok) return alert(data.error || "Update failed");

      alert(data.message || "Appointment updated successfully.");
      await loadMyBookings();
      closeEdit();
    } catch (e) {
      console.error(e);
      alert("Server error.");
    }
  };

  const deleteAppointment = async (b) => {
    const ok = window.confirm("Are you sure you want to delete this appointment?");
    if (!ok) return;

    try {
      const r = await fetch(`${API_BASE}/api/bookings/${b._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await r.json();
      if (!r.ok) return alert(data.error || "Delete failed");

      alert(data.message || "Appointment deleted successfully.");
      await loadMyBookings();
    } catch (e) {
      console.error(e);
      alert("Server error.");
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Profile</h2>
          <div className="text-muted">Manage your appointments and inquiries</div>
        </div>

        <div className="d-flex gap-3">
          <button
            className="btn btn-light border rounded-pill px-3"
            onClick={() => navigate("/")}
          >
          ← Back to Home
          </button>
          <button
            className="btn btn-danger rounded-pill px-4"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("loginTime");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="fw-bold fs-5">{fullName || "User"}</div>
            <div className="text-muted">{me?.email || ""}</div>
          </div>

          <div className="d-flex gap-2">
            <span className="badge bg-primary">Appointments: {appointments.length}</span>
            <span className="badge bg-secondary">Inquiries: {inquiries.length}</span>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button
          className={`btn rounded-pill px-4 ${
            activeTab === "appointments" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("appointments")}
        >
          My Appointments
        </button>

        <button
          className={`btn rounded-pill px-4 ${
            activeTab === "inquiries" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("inquiries")}
        >
          My Inquiries
        </button>
      </div>

      {activeTab === "appointments" ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h4 className="mb-3 fw-bold">All Appointments</h4>

            {appointments.length === 0 ? (
              <div className="alert alert-info mb-0">No appointments booked yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Subject</th>
                      <th>Tutor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th style={{ width: 240 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => {
                     const status = getLectureStatus(a, nowTick);

                      return (
                        <tr key={a._id}>
                          <td className="fw-semibold">{a.subject}</td>
                          <td>{a.tutor}</td>
                          <td>{formatDateNice(a.date)}</td>
                          <td>
                            {formatTime12Hour(a.startTime)} - {formatTime12Hour(a.endTime)}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                status === "Booked"
                                  ? "bg-primary"
                                  : status === "Started"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              {status === "Booked" && (
                                <>
                                  <button
                                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                    onClick={() => openEdit(a)}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                    onClick={() => deleteAppointment(a)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}

                              {status === "Completed" && (
                                <button
                                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                  onClick={() => deleteAppointment(a)}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h4 className="mb-3 fw-bold">My Inquiries</h4>

            {inquiries.length === 0 ? (
              <div className="alert alert-info mb-0">No inquiries yet.</div>
            ) : (
              <div className="row g-3">
                {inquiries.map((x) => (
                  <div className="col-12" key={x._id}>
                    <div className="border rounded-4 p-3">
                      <div className="d-flex justify-content-between flex-wrap gap-2">
                        <div className="fw-bold">{x.subject}</div>
                        <span className="badge bg-secondary">{x.status || "open"}</span>
                      </div>
                      <div className="text-muted mt-2">{x.message}</div>
                      <div className="small text-muted mt-2">
                        {x.createdAt ? new Date(x.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,.45)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Appointment</h5>
                <button type="button" className="btn-close" onClick={closeEdit}></button>
              </div>

              <div className="modal-body pt-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Tutor</label>
                    <select
                      className="form-select"
                      value={editForm.tutor}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          tutor: e.target.value,
                          subject: "",
                          startTime: "",
                          endTime: "",
                        }))
                      }
                    >
                      <option value="">Select Tutor</option>
                      {tutors.map((t) => {
                        const full = `${t.firstName || ""} ${t.lastName || ""}`.trim();
                        return (
                          <option key={t._id} value={full}>
                            {full}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Subject</label>
                    <select
                      className="form-select"
                      value={editForm.subject}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, subject: e.target.value }))
                      }
                    >
                      <option value="">Select Subject</option>
                      {tutorSubjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      min={new Date().toISOString().split("T")[0]}
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          date: e.target.value,
                          startTime: "",
                          endTime: "",
                        }))
                      }
                    />
                    {isSunday(editForm.date) && (
                      <div className="text-danger small mt-1">Sunday is a holiday.</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Select {tutorAvailability.duration}-Hour Slot
                    </label>

                    <div className="d-flex flex-wrap gap-2">
                      {generateTimeSlots().map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={slot.disabled}
                          className={`btn btn-sm rounded-pill px-3 ${
                             slot.disabled
    ? "btn-danger"
    : slot.isSelected
    ? "btn-primary"
    : "btn-outline-primary"
                          }`}
                          onClick={() =>
                            setEditForm((p) => ({
                              ...p,
                              startTime: slot.start,
                              endTime: slot.end,
                            }))
                          }
                        >
                          {formatTime12Hour(slot.start)} - {formatTime12Hour(slot.end)}
                        </button>
                      ))}
                    </div>

                    {editForm.startTime && (
                      <div className="mt-3 text-success fw-semibold">
                        Selected: {formatTime12Hour(editForm.startTime)} -{" "}
                        {formatTime12Hour(editForm.endTime)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-light border rounded-pill px-4"
                  onClick={closeEdit}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={saveEdit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
