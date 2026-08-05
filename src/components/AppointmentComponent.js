
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE from "../services/api";
const SESSION_MS = 24 * 60 * 60 * 1000; // 24 hours

function AppointmentComponent() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [tutor, setTutor] = useState(""); // will store tutorId (_id)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [bookedSlots, setBookedSlots] = useState([]); // tutor+date bookings
  const [userBookedSlots, setUserBookedSlots] = useState([]); // user bookings (refresh-proof)

  const [tutors, setTutors] = useState([]);

  const isSunday = (d) => d && new Date(d).getDay() === 0;

  // ✅ today in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  // ✅ past date check
  const isPastDate = useCallback(
    (d) => {
      if (!d) return false;
      return d < todayStr;
    },
    [todayStr]
  );

  // ✅ 24h -> 12h AM/PM display
  const formatTime12Hour = useCallback((time) => {
    if (!time) return "";
    const [hStr, mStr] = String(time).split(":");
    let hour = Number(hStr);
    const minute = mStr || "00";
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
  }, []);

  const allBooked = useMemo(() => {
    return [...(bookedSlots || []), ...(userBookedSlots || [])];
  }, [bookedSlots, userBookedSlots]);

  const clearAuthStorage = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
  }, []);

const redirectToLoginWithAlert = useCallback(
  (msg = "Please login/register first.") => {
    alert(msg);
    navigate("/login");
  },
  [navigate]
);

  const isSessionValid = useCallback(() => {
    const token = localStorage.getItem("token");
    const loginTime = Number(localStorage.getItem("loginTime") || 0);

    if (!token || !loginTime) return false;
    if (Date.now() - loginTime > SESSION_MS) return false;

    return true;
  }, []);

  // ✅ fetch tutors for dropdown (public)
  useEffect(() => {
    fetch(`${API_BASE}/api/tutors`)
      .then((r) => r.json())
      .then((list) => setTutors(Array.isArray(list) ? list : []))
      .catch((e) => {
        console.error("Fetch tutors failed:", e);
        setTutors([]);
      });
  }, []);

  // ✅ selected tutor object
  const selectedTutor = useMemo(() => {
    return tutors.find((t) => String(t._id) === String(tutor));
  }, [tutors, tutor]);

  // ✅ tutor full name
  const tutorName = useMemo(() => {
    return selectedTutor
      ? `${selectedTutor.firstName || ""} ${selectedTutor.lastName || ""}`.trim()
      : "";
  }, [selectedTutor]);

  // ✅ subjects from selected tutor
  const tutorSubjects = useMemo(() => {
    const s = selectedTutor?.subjects;
    if (!s) return [];
    if (Array.isArray(s)) return s.map((x) => String(x).trim()).filter(Boolean);
    return String(s)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [selectedTutor]);

  // ✅ availability for selected tutor
  const tutorAvailability = useMemo(() => {
    const av = selectedTutor?.availability || {};
    return {
      start: Number(av.startHour ?? 10),
      end: Number(av.endHour ?? 18),
      duration: Number(av.slotDuration ?? 2),
    };
  }, [selectedTutor]);

  // ✅ auto-fill if session valid
  useEffect(() => {
    if (!isSessionValid()) {
      setName("");
      setEmail("");
      setUserBookedSlots([]);
      return;
    }

    const userStr = localStorage.getItem("user");
    let localEmail = "";

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        if (fullName) setName(fullName);
        if (user.email) {
          setEmail(user.email);
          localEmail = user.email;
        }
      } catch (e) {
        console.error("Invalid user in localStorage:", e);
      }
    }

    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((u) => {
        if (u?.error) return;
        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        if (fullName) setName(fullName);
        if (u.email) {
          setEmail(u.email);
          localEmail = u.email;

          fetch(`${API_BASE}/api/user-bookings/${encodeURIComponent(u.email)}`)
            .then((r) => r.json())
            .then((list) => setUserBookedSlots(Array.isArray(list) ? list : []))
            .catch((err) => console.error("user bookings fetch error:", err));
        }
      })
      .catch((err) => console.error("Error fetching /api/me:", err));

    if (localEmail) {
      fetch(`${API_BASE}/api/user-bookings/${encodeURIComponent(localEmail)}`)
        .then((r) => r.json())
        .then((list) => setUserBookedSlots(Array.isArray(list) ? list : []))
        .catch((err) => console.error("user bookings fetch error:", err));
    }
  }, [isSessionValid]);

  // ✅ reset slot and subject
  useEffect(() => {
    setStartTime("");
    setEndTime("");
    setSubject("");
  }, [tutor, date]);

  // ✅ fetch tutor/date booked slots
  useEffect(() => {
    if (tutorName && date && !isSunday(date) && !isPastDate(date)) {
      fetch(
        `${API_BASE}/api/bookings?tutor=${encodeURIComponent(tutorName)}&date=${encodeURIComponent(
          date
        )}`
      )
        .then((res) => res.json())
        .then((data) => setBookedSlots(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Error fetching slots:", err);
          setBookedSlots([]);
        });
    } else {
      setBookedSlots([]);
    }
  }, [tutorName, date, isPastDate]);

  const generateTimeSlots = () => {
    if (!date || !tutor || isSunday(date) || isPastDate(date)) return [];

    const { start, end, duration } = tutorAvailability;

    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(duration)) return [];
    if (duration <= 0) return [];
    if (start >= end) return [];

    const slots = [];
    const now = new Date();

    for (let hour = start; hour < end; hour += duration) {
      const startStr = `${hour.toString().padStart(2, "0")}:00`;
      const endHour = hour + duration;
      if (endHour > end) break;

      const endStr = `${endHour.toString().padStart(2, "0")}:00`;

      const isAlreadyBooked = allBooked.some(
        (slot) => slot.date === date && startStr < slot.endTime && endStr > slot.startTime
      );

      // ✅ today na past time slots disable
      let isPastTimeSlot = false;
      if (date === todayStr) {
        const slotStartDateTime = new Date(`${date}T${startStr}:00`);
        if (slotStartDateTime <= now) {
          isPastTimeSlot = true;
        }
      }

      slots.push({
        start: startStr,
        end: endStr,
        isBooked: isAlreadyBooked || isPastTimeSlot,
      });
    }

    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSessionValid()) {
      clearAuthStorage();
   redirectToLoginWithAlert("Please login or register first to book a demo class.");
      
      return;
    }

    if (isPastDate(date)) return alert("Past date select kari shakta nathi.");
    if (!startTime || !endTime) return alert("Please select a time slot");
    if (isSunday(date)) return alert("Sunday is a holiday");
    if (!tutorName) return alert("Please select a tutor");

    const formData = { subject, tutor: tutorName, name, email, date, startTime, endTime };

    try {
      const response = await fetch(`${API_BASE}/api/book-demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return alert(data.error || "Something went wrong");
      }

      alert(data.message || "🎉 Demo class booked!");

      const fresh = await fetch(
        `${API_BASE}/api/bookings?tutor=${encodeURIComponent(tutorName)}&date=${encodeURIComponent(
          date
        )}`
      );
      const freshData = await fresh.json();
      setBookedSlots(Array.isArray(freshData) ? freshData : []);

      const uFresh = await fetch(`${API_BASE}/api/user-bookings/${encodeURIComponent(email)}`);
      const uData = await uFresh.json();
      setUserBookedSlots(Array.isArray(uData) ? uData : []);

      setStartTime("");
      setEndTime("");
      setSubject("");
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Please try again.");
    }
  };

  const loggedIn = isSessionValid();
  const slots = generateTimeSlots();

  return (
    <div className="container-fluid bg-primary my-5 py-5">
      <div className="container py-5">
        <div className="row gx-5">
          <div className="col-lg-6 mb-5 mb-lg-0">
            <div className="mb-4">
              <h5 className="d-inline-block text-white text-uppercase border-bottom border-5">
                Book a Tutor
              </h5>
              <h1 className="display-4 text-white">
                Schedule a Demo Class With Expert Tutors
              </h1>
            </div>
            <p className="text-white mb-5">
              City Tutor Hub helps students connect with experienced tutors for personalized learning.
            </p>

            {!loggedIn && (
              <div className="text-white">
                
              </div>
            )}
          </div>

          <div className="col-lg-6">
            <div className="bg-white text-center rounded p-5">
              <h1 className="mb-4">Book a Demo Class</h1>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <select
                      className="form-select bg-light border-0"
                      style={{ height: "55px" }}
                      value={tutor}
                      onChange={(e) => setTutor(e.target.value)}
                      required
                    >
                      <option value="">Select Tutor</option>
                      {tutors.map((t) => {
                        const full = `${t.firstName || ""} ${t.lastName || ""}`.trim();
                        return (
                          <option key={t._id} value={t._id}>
                            {full || "Tutor"}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="col-12 col-sm-6">
                    <select
                      className="form-select bg-light border-0"
                      style={{ height: "55px" }}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      disabled={!tutor}
                    >
                      <option value="">Choose Subject</option>
                      {tutorSubjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-sm-6">
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="Student Name"
                      style={{ height: "55px" }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      readOnly={loggedIn}
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <input
                      type="email"
                      className="form-control bg-light border-0"
                      placeholder="Parent / Student Email"
                      style={{ height: "55px" }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly={loggedIn}
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <input
                      type="date"
                      className="form-control bg-light border-0"
                      style={{ height: "55px" }}
                      value={date}
                      min={todayStr}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        if (isPastDate(selectedDate)) {
                          alert("Past date select kari shakta nathi.");
                          setDate("");
                          return;
                        }
                        setDate(selectedDate);
                      }}
                      required
                    />
                  </div>

                  {isPastDate(date) && (
                    <div className="col-12 text-danger fw-bold">
                      Past date allow nathi. Please select today or future date.
                    </div>
                  )}

                  {isSunday(date) && (
                    <div className="col-12 text-danger fw-bold">
                      Sunday is a holiday. Please select another day.
                    </div>
                  )}

                  <div className="col-12">
                    <label className="form-label fw-bold">
                      Select {tutorAvailability.duration}-Hour Slot
                    </label>

                    <div className="d-flex flex-wrap gap-2">
                      {slots.map((slot, index) => (
                        <button
                          type="button"
                          key={index}
                          disabled={slot.isBooked}
                          onClick={() => {
                            setStartTime(slot.start);
                            setEndTime(slot.end);
                          }}
                          className={`btn ${    slot.isBooked
      ? "btn-danger"
      : startTime === slot.start && endTime === slot.end
      ? "btn-primary"
      : "btn-outline-primary"}`}
                        >
                          {formatTime12Hour(slot.start)} - {formatTime12Hour(slot.end)}
                        </button>
                      ))}
                    </div>

                    {tutor && date && !isSunday(date) && !isPastDate(date) && slots.length === 0 ? (
                      <div className="mt-2 text-danger fw-bold">
                        No slots available for selected tutor/date.
                      </div>
                    ) : null}

                    {startTime && (
                      <div className="mt-2 text-success">
                        Selected: {formatTime12Hour(startTime)} - {formatTime12Hour(endTime)}
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <button className="btn btn-primary w-100 py-3" type="submit">
                      Book Demo Class
                    </button>
                  </div>
                </div>
              </form>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentComponent;