import { useState } from "react";
import "./AuthPage.css";
import { FaFacebookF, FaGoogle, FaTwitter, FaGithub } from "react-icons/fa";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            LOGIN
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            REGISTER
          </button>
        </div>

        {/* Social Login */}
        <p className="social-text">Sign in with:</p>
        <div className="social-icons">
          <FaFacebookF />
          <FaGoogle />
          <FaTwitter />
          <FaGithub />
        </div>

        <p className="divider">OR</p>

        {/* Form */}
        <form className="auth-form">
          {!isLogin && (
            <input type="text" placeholder="Full Name" required />
          )}

          <input
            type="text"
            placeholder="Email or username"
            required
          />
          <input type="password" placeholder="Password" required />

          {isLogin && (
            <div className="form-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>
              <span className="forgot">Forgot password?</span>
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? "Not a member?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
