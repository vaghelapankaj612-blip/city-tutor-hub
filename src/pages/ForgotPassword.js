import { useState,useEffect } from "react";
import { NavLink,useNavigate } from "react-router-dom";
import "../styles/authGlass.css";

export default function ForgotPassword() {
    const navigate = useNavigate();
    useEffect(() => {
    // current page history માં push કરો
    window.history.pushState(null, "", window.location.href);
  
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
  
    window.addEventListener("popstate", handlePopState);
  
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!emailOrMobile) {
      setError("Email/Mobile required.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrMobile }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send reset link.");
        return;
      }

      setMsg(data.message || "If account exists, reset link has been sent.");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authg-wrap">
      <div className="authg-noise" />
      <div className="authg-card">
        <div className="authg-left">
          <div className="authg-badge">🔐 Password Help</div>
          <h1 className="authg-title">Forgot Password</h1>
          <p className="authg-sub">Enter your email or mobile number. The reset link will be sent to your email.</p>

          <p className="authg-foot" style={{ marginTop: 18 }}>
            Back to <NavLink to="/login">Login</NavLink>
          </p>
        </div>

        <div className="authg-right">
          <h2 className="authg-formTitle">Get Reset Link</h2>

          <form onSubmit={onSubmit}>
            <div className="authg-field">
              <label className="authg-label">Email or Mobile</label>
              <input
                className="authg-input"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder="you@example.com / 9876543210"
              />
            </div>

            {error && <div className="authg-error">{error}</div>}
            {msg && <div className="authg-success">{msg}</div>}

            <button className="authg-btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="authg-foot">
              Remembered? <NavLink to="/login">Login</NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
