import { useState } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import "../styles/authGlass.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!password || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setMsg(data.message || "Password reset successful.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
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
          <div className="authg-badge">🔑 New Password</div>
          <h1 className="authg-title">Reset Password</h1>
          <p className="authg-sub">Enter Your New Password And Login again..</p>

          <p className="authg-foot" style={{ marginTop: 18 }}>
            Back to <NavLink to="/login">Login</NavLink>
          </p>
        </div>

        <div className="authg-right">
          <h2 className="authg-formTitle">Set New Password</h2>

          <form onSubmit={onSubmit}>
            <div className="authg-field">
              <label className="authg-label">New Password</label>
              <input
                type="password"
                className="authg-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="authg-field">
              <label className="authg-label">Confirm Password</label>
              <input
                type="password"
                className="authg-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            {error && <div className="authg-error">{error}</div>}
            {msg && <div className="authg-success">{msg}</div>}

            <button className="authg-btn" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
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