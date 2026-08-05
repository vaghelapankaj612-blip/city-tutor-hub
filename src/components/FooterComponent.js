import { Link } from "react-router-dom";

function FooterComponent() {
  return (
    <footer>
      <div className="container-fluid footer-modern text-light mt-5 pt-5">
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-4 col-md-6">
              <h4 className="footer-title">City Tutor Hub</h4>
              <p className="mb-4">
                Trusted tutoring platform for personalized learning — school, competitive exams, and skills.
              </p>
              <p className="mb-2">
                <i className="fa fa-map-marker-alt text-primary me-3"></i>
                Gujarat, India
              </p>
              <p className="mb-2">
                <i className="fa fa-envelope text-primary me-3"></i>
                support@citytutorhub.com
              </p>
              <p className="mb-0">
                <i className="fa fa-phone-alt text-primary me-3"></i>
                +91 98765 43210
              </p>
            </div>

            <div className="col-lg-2 col-md-6">
              <h5 className="footer-subtitle">Quick Links</h5>
              <div className="d-flex flex-column gap-2">
                <Link className="footer-link" to="/">Home</Link>
                <Link className="footer-link" to="/about">About</Link>
                <Link className="footer-link" to="/service">Subjects</Link>
                <Link className="footer-link" to="/appointment">Book Demo</Link>
                <Link className="footer-link" to="/contact">Contact</Link>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <h5 className="footer-subtitle">Popular Subjects</h5>
              <div className="d-flex flex-column gap-2">
                <Link className="footer-link" to="/service">Mathematics</Link>
                <Link className="footer-link" to="/service">Science</Link>
                <Link className="footer-link" to="/service">English</Link>
                <Link className="footer-link" to="/service">Computer</Link>
                <Link className="footer-link" to="/service">Competitive Exams</Link>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              


              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Subscribed! (Demo)");
                }}
              >
    
              </form>

              <div className="mt-4">
                <h6 className="text-primary text-uppercase mb-3" style={{fontSize:"40px"}}>Follow Us</h6>
                <div className="d-flex gap-2">
                  <a className="social-btn" href="https://facebook.com" target="_blank" rel="noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a className="social-btn" href="https://instagram.com" target="_blank" rel="noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a className="social-btn" href="https://linkedin.com" target="_blank" rel="noreferrer">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a className="social-btn" href="https://youtube.com" target="_blank" rel="noreferrer">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="container border-top border-secondary py-4">
          <div className="text-center small text-muted-light">
            © {new Date().getFullYear()} City Tutor Hub. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterComponent;
