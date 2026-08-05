import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="hero-modern">
      <div className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-7 text-center text-lg-start">
            <span className="hero-badge">
              Welcome to City Tutor Hub
            </span>

            <h1 className="hero-title mt-3">
              Learn Smarter with <span className="text-primary">Expert Tutors</span>
            </h1>

            <p className="hero-subtitle mt-3">
              Personalized tutoring for school subjects, competitive exams, and skill development —
              online or offline.
            </p>

            <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3 mt-4">
              <Link to="/service" className="btn btn-primary rounded-pill px-4 py-3">
                Explore Subjects
              </Link>
              <Link to="/appointment" className="btn btn-outline-primary rounded-pill px-4 py-3">
                Book a Demo
              </Link>
              <Link to="/contact" className="btn btn-light rounded-pill px-4 py-3">
                Talk to Us
              </Link>
            </div>

            <div className="hero-stats mt-5">
              <div className="hero-stat">
                <div className="hero-stat-number">500+</div>
                <div className="hero-stat-text">Happy Students</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">50+</div>
                <div className="hero-stat-text">Expert Tutors</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">1:1</div>
                <div className="hero-stat-text">Personalized Support</div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="hero-card">
              <div className="hero-card-top">
                <h5 className="mb-1" style={{color:"#2274ef"}}>Quick Demo Booking</h5>
                <p className="mb-0 text-muted">Pick subject + tutor + slot in 2 minutes</p>
              </div>

              <div className="hero-card-body">
                <div className="d-grid gap-2">
                  <Link to="/appointment" className="btn btn-primary rounded-pill py-3">
                    Book Demo Class
                  </Link>
                  <Link to="/service" className="btn btn-outline-primary rounded-pill py-3">
                    View Subjects
                  </Link>
                </div>

                <hr className="my-4" />

                <div className="d-flex align-items-center gap-3">
                  <div className="hero-mini-icon">
                    <i className="fa fa-shield-alt"></i>
                  </div>
                  <div>
                    <div className="fw-bold"style={{color:"#4885e1"}}>Verified Tutors</div>
                    <div className="text-muted small">Quality checked, experienced faculty</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
