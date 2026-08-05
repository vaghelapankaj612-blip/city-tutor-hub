import { NavLink, Link, useNavigate } from "react-router-dom";

const SESSION_MS = 24 * 60 * 60 * 1000; // 24 hours

function NavbarComponent() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const loginTime = Number(localStorage.getItem("loginTime") || 0);

  const loggedIn = !!token && !!loginTime && Date.now() - loginTime <= SESSION_MS;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    navigate("/login");
  };

  return (
    <div className="container-fluid sticky-top bg-white shadow-sm">
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light py-3 py-lg-0">
          <Link to="/" className="navbar-brand">
            <h1 className="m-0 text-uppercase text-primary brand-title">
              <i className="fa fa-graduation-cap me-2"></i>City Tutor Hub
            </h1>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ms-auto py-0">
              <NavLink to="/" className="nav-item nav-link">
                Home
              </NavLink>

              <NavLink to="/about" className="nav-item nav-link">
                About
              </NavLink>

              <NavLink to="/service" className="nav-item nav-link">
                Subjects
              </NavLink>

              <NavLink to="/appointment" className="nav-item nav-link">
                Book Demo
              </NavLink>

              <NavLink to="/contact" className="nav-item nav-link">
                Contact
              </NavLink>

              {/* ✅ Right side actions */}
              <div className="d-flex align-items-center ms-lg-3 gap-2 py-3 py-lg-0">
                {loggedIn ? (
                  <>
                    <NavLink
                      to="/profile"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    >
                      Profile
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-danger btn-sm rounded-pill px-3"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    >
                      Login
                    </NavLink>

                    <NavLink
                      to="/register"
                      className="btn btn-primary btn-sm rounded-pill px-3"
                    >
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default NavbarComponent;
