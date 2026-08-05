function TeamComponent() {
  const tutors = [
    {
      name: "Mr. Rajesh Patel",
      role: "Mathematics Expert",
      img: "img/tutor-1.jpg",
      desc: "10+ years experience in school + competitive exam mentoring.",
    },
    {
      name: "Ms. Priya Sharma",
      role: "Science Specialist",
      img: "img/tutor-2.jpg",
      desc: "Concept-based teaching with experiments & smart exam strategies.",
    },
    {
      name: "Mr. Anil Desai",
      role: "English & Communication",
      img: "img/tutor-3.jpg",
      desc: "Fluency building, writing, grammar & confidence improvement.",
    },
  ];

  return (
    <section className="container-fluid py-5">
      <div className="container">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: "600px" }}>
          <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
            Our Tutors
          </h5>
          <h1 className="display-5 mt-2">Meet Our Expert Faculty</h1>
          <p className="text-muted mt-3">
            Verified tutors who focus on clarity, confidence, and results.
          </p>
        </div>

        <div className="row g-4">
          {tutors.map((t, i) => (
            <div className="col-lg-4 col-md-6" key={i}>
              <div className="tutor-card">
                <div className="tutor-img-wrap">
                  <img src={t.img} alt={t.name} className="tutor-img" />
                </div>

                <div className="p-4">
                  <h4 className="mb-1">{t.name}</h4>
                  <div className="text-primary fw-semibold">{t.role}</div>
                  <p className="text-muted mt-3 mb-0">{t.desc}</p>

                  <div className="d-flex gap-2 mt-4">
                    <a className="icon-pill" href="https://twitter.com" target="_blank" rel="noreferrer">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a className="icon-pill" href="https://facebook.com" target="_blank" rel="noreferrer">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a className="icon-pill" href="https://linkedin.com" target="_blank" rel="noreferrer">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TeamComponent;
