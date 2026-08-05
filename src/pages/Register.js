import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/authGlass.css";
import API_BASE from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    mobile: "",
    email: "",
    age: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const isValid = useMemo(() => {
    if (!form.firstName || !form.lastName) return false;
    if (!form.gender) return false;
    if (!form.mobile || String(form.mobile).length < 10) return false;
    if (!form.email) return false;
    if (!form.age) return false;
    if (!form.password || form.password.length < 6) return false;
    if (form.password !== form.confirmPassword) return false;
    if (!form.agree) return false;
    return true;
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValid) {
      setError("Please fill all fields correctly.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          gender: form.gender,
          mobile: form.mobile,
          email: form.email,
          age: form.age,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Register failed.");
        return;
      }

      // ✅ Save token + user + loginTime (24h expiry)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("loginTime", String(Date.now()));

      navigate("/");
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authg-wrap">
      <div className="authg-noise" />
      <div className="authg-card"style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.08)",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .2s ease",
            zIndex: 20,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255,255,255,.18)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,.08)";
            e.target.style.transform = "scale(1)";
          }}
        >
          ✕
        </button>

       
        <div className="authg-left">
          <div className="authg-badge">🫧 Create Account</div>
          <h1 className="authg-title">Join City Tutor Hub</h1>
          <p className="authg-sub">

            Create account and schedule demo class by connecting with tutors.
          </p>

          <div className="authg-features">
            <div className="authg-feature">
              <div className="authg-dot" />
              Personalized tutor recommendations
            </div>
            <div className="authg-feature">
              <div className="authg-dot" />
              Quick booking with time-slot availability
            </div>
            <div className="authg-feature">
              <div className="authg-dot" />
              Safer account & notifications
            </div>
          </div>

          <p className="authg-foot" style={{ marginTop: 18 }}>
            Already have an account? <NavLink to="/login">Login</NavLink>
          </p>
        </div>

        <div className="authg-right">
          <h2 className="authg-formTitle">Register</h2>

          <form onSubmit={onSubmit}>
            <div className="authg-grid">
              <div className="authg-field">
                <label className="authg-label">First Name</label>
                <input
                  className="authg-input"
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  placeholder="Pankaj"
                />
              </div>

              <div className="authg-field">
                <label className="authg-label">Last Name</label>
                <input
                  className="authg-input"
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  placeholder="Vaghela"
                />
              </div>

              <div className="authg-field">
                <label className="authg-label">Gender</label>
                <select
                  className="authg-input"
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="authg-field">
                <label className="authg-label">Mobile No</label>
                <input
                  className="authg-input"
                  name="mobile"
                  value={form.mobile}
                  onChange={onChange}
                  placeholder="9876543210"
                  inputMode="numeric"
                />
              </div>

              <div className="authg-field">
                <label className="authg-label">Email</label>
                <input
                  className="authg-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                />
              </div>

              <div className="authg-field">
                <label className="authg-label">Age</label>
                <input
                  className="authg-input"
                  name="age"
                  value={form.age}
                  onChange={onChange}
                  placeholder="18"
                  inputMode="numeric"
                />
              </div>

              <div className="authg-field">
                <label className="authg-label">Password</label>
                <input
                  className="authg-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Min 6 characters"
                />
              </div>

              <div className="authg-field">
                <label className="authg-label">Confirm Password</label>
                <input
                  className="authg-input"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="authg-row">
              <label className="authg-check">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={onChange}
                />
                I agree to terms
              </label>

              <NavLink className="authg-link" to="/login">
                Already registered?
              </NavLink>
            </div>

            {error && <div className="authg-error">{error}</div>}

            <button className="authg-btn" type="submit" disabled={!isValid || loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="authg-foot">By continuing, you agree to our policies.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
