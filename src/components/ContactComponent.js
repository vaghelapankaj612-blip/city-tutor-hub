
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE from "../services/api";
const SESSION_MS = 24 * 60 * 60 * 1000;

function ContactComponent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [showLoginMsg, setShowLoginMsg] = useState(false);

  const isSessionValid = useCallback(() => {
    const token = localStorage.getItem("token");
    const loginTime = Number(localStorage.getItem("loginTime") || 0);
    if (!token || !loginTime) return false;
    if (Date.now() - loginTime > SESSION_MS) return false;
    return true;
  }, []);

  const loggedIn = isSessionValid();

  useEffect(() => {
    if (!loggedIn) return;

    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((u) => {
        if (u?.error) return;
        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        setForm((p) => ({
          ...p,
          name: fullName || p.name,
          email: u.email || p.email,
        }));
      })
      .catch((err) => console.error("me fetch error:", err));
  }, [loggedIn]);

  useEffect(() => {
    if (loggedIn) setShowLoginMsg(false);
  }, [loggedIn]);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!loggedIn) {
      setShowLoginMsg(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Something went wrong");

      alert(data.message || "Inquiry sent successfully.");
      setForm((p) => ({ ...p, subject: "", message: "" }));
    } catch (err) {
      console.error("inquiry submit error:", err);
      alert("Server error. Try again.");
    }
  };

  return (
    <div className="container-fluid pt-5">
      <div className="container">
        {showLoginMsg && !loggedIn && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <b>You are not Login/Register.</b> Please <b>Login/Register</b> first to send an inquiry.
            </div>

            <button
              className="btn btn-primary btn-sm rounded-pill px-3"
              type="button"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        )}

        <div className="text-center mx-auto mb-5" style={{ maxWidth: "600px" }}>
          <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
            Have Questions?
          </h5>
          <h1 className="display-5 mt-2">Get In Touch With City Tutor Hub</h1>
        </div>

        <div className="row g-4 align-items-stretch">
          <div className="col-lg-6">
            <div className="map-wrap">
              <iframe
                className="w-100 h-100 rounded"
                src="https://www.google.com/maps?q=Rajkot,Gujarat&output=embed"
                loading="lazy"
                title="City Tutor Hub Location"
                style={{ border: 0, minHeight: 420 }}
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="contact-form-card">
              <h3 className="mb-4">Send us a message</h3>

              <form onSubmit={onSubmit}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="Your Name"
                      style={{ height: "55px" }}
                      readOnly={loggedIn}
                      required
                    />
                  </div>

                  <div className="col-sm-6">
                    <input
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      type="email"
                      className="form-control bg-light border-0"
                      placeholder="Email"
                      style={{ height: "55px" }}
                      readOnly={loggedIn}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={onChange}
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="Subject"
                      style={{ height: "55px" }}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      className="form-control bg-light border-0"
                      rows="6"
                      placeholder="Message..."
                      required
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <button className="btn btn-primary w-100 py-3 rounded-pill" type="submit">
                      Send Inquiry
                    </button>
                  </div>
                </div>
              </form>

              {!loggedIn && (
                <div className="small text-muted mt-3">
                  Please login/Register first if you want to send an inquiry.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactComponent;
