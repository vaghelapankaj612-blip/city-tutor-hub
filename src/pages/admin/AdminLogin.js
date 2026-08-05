import React, { useState } from "react";
import { adminApi } from "../../services/adminApi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      setLoading(true);

      // ✅ Now matches adminApi.login(email, password)
      const data = await adminApi.login(email, password);

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      window.location.href = "/admin";
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-app">
      <div className="admin-login">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <p>Sign in to access the dashboard</p>

          {err ? <div className="alert">{err}</div> : null}

          <form onSubmit={submit}>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@citytutorhub.com"
              />
            </div>

            <div className="form-row">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button className="btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}