import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/authGlass.css";
import API_BASE from "../services/api";

export default function Login() {
  const navigate = useNavigate();
//   useEffect(() => {
//   // current page history માં push કરો
//   window.history.pushState(null, "", window.location.href);

//   const handlePopState = () => {
//     window.history.pushState(null, "", window.location.href);
//   };

//   window.addEventListener("popstate", handlePopState);

//   return () => {
//     window.removeEventListener("popstate", handlePopState);
//   };
// }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     navigate("/", { replace: true });
  //   }
  // }, [navigate]);
  useEffect(() => {
  const token = localStorage.getItem("token");
  const loginTime = Number(localStorage.getItem("loginTime") || 0);

  const SESSION_MS = 24 * 60 * 60 * 1000;

  const isValid =
    token && loginTime && Date.now() - loginTime <= SESSION_MS;

  if (isValid) {
    navigate("/", { replace: true });
  } else {
    // ❗ invalid hoy to clear kari nakho
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
  }
}, [navigate]);

  const [form, setForm] = useState({
    emailOrMobile: "",
    password: "",
    remember: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.emailOrMobile || !form.password) {
      setError("Email/Mobile and password required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrMobile: form.emailOrMobile,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      // ✅ Save token + user + loginTime (24h expiry)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("loginTime", String(Date.now()));

      navigate("/", { replace: true });
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authg-wrap">
      <div className="authg-noise" />
      <div className="authg-card" style={{ position: "relative" }}>
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
          <div className="authg-badge">✨ City Tutor Hub • Secure Access</div>
          <h1 className="authg-title">Welcome back</h1>
          <p className="authg-sub">
            Manage demo bookings and tutor schedule by logging in.
          </p>

          <div className="authg-features">
            <div className="authg-feature">
              <div className="authg-dot" />
              Faster demo booking & schedule management
            </div>
            <div className="authg-feature">
              <div className="authg-dot" />
              Verified tutors & personalized learning support
            </div>
            <div className="authg-feature">
              <div className="authg-dot" />
              Easy reschedule / cancel from email
            </div>
          </div>

          <p className="authg-foot" style={{ marginTop: 18 }}>
            New here? <NavLink to="/register">Create an account</NavLink>
          </p>
        </div>

        <div className="authg-right">
          <h2 className="authg-formTitle">Login</h2>

          <form onSubmit={onSubmit}>
            <div className="authg-field">
              <label className="authg-label">Email or Mobile</label>
              <input
                className="authg-input"
                name="emailOrMobile"
                value={form.emailOrMobile}
                onChange={onChange}
                placeholder="you@example.com / 9876543210"
              />
            </div>

            <div className="authg-field" style={{ marginTop: 12 }}>
              <label className="authg-label">Password</label>
              <input
                className="authg-input"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
              />
            </div>

            <div className="authg-row">
              <label className="authg-check">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={onChange}
                />
                Remember me
              </label>

              <NavLink className="authg-link" to="/forgot-password">
                Forgot password?
              </NavLink>
            </div>

            {error && <div className="authg-error">{error}</div>}

            <button className="authg-btn" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="authg-foot">
              Don’t have an account? <NavLink to="/register">Register</NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}