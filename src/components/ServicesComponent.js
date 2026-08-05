

import { useState } from "react";
import { Link } from "react-router-dom";

function ServiceComponent() {
  const [playingIndex, setPlayingIndex] = useState(null);
   const services = [
    {
      title: "Mathematics",
      icon: "fa-calculator",
      desc: "Strong fundamentals + problem solving for all grades.",
      video: "https://www.youtube.com/embed/3eG3wvWjRM0?autoplay=1",
      thumb: "https://img.youtube.com/vi/3eG3wvWjRM0/hqdefault.jpg",
    },
    {
      title: "Science",
      icon: "fa-flask",
      desc: "Concept clarity with smart notes and exam practice.",
      video: "https://www.youtube.com/embed/7XDCzmungVk?autoplay=1",
      thumb: "https://img.youtube.com/vi/7XDCzmungVk/hqdefault.jpg",
    },
    {
      title: "English",
      icon: "fa-book-open",
      desc: "Reading, writing, grammar and communication improvement.",
      video: "https://www.youtube.com/embed/KXXf-Py2-t8?autoplay=1",
      thumb: "https://img.youtube.com/vi/KXXf-Py2-t8/hqdefault.jpg",
    },
    {
      title: "Computer",
      icon: "fa-laptop-code",
      desc: "Programming basics, logic building and projects.",
      video: "https://www.youtube.com/embed/vvN0xbnB198?autoplay=1",
      thumb: "https://img.youtube.com/vi/vvN0xbnB198/hqdefault.jpg",
    },
    {
      title: "Competitive Exams",
      icon: "fa-user-graduate",
      desc: "JEE/NEET/UPSC + other exams with strategies.",
      video: "https://www.youtube.com/embed/3eG3wvWjRM0?autoplay=1",
      thumb: "https://img.youtube.com/vi/3eG3wvWjRM0/hqdefault.jpg",
    },
    {
      title: "Spoken English",
      icon: "fa-comments",
      desc: "Confidence + fluency via interactive speaking sessions.",
      video: "https://www.youtube.com/embed/FLbgFnaRuNQ?autoplay=1",
      thumb: "https://img.youtube.com/vi/FLbgFnaRuNQ/hqdefault.jpg",
    },
  ];

  return (
    <section className="services-section container-fluid py-5">
      <div className="container">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: "650px" }}>
          <h5 className="services-badge d-inline-block text-uppercase">
            Subjects
          </h5>
          <h1 className="display-5 mt-3 services-title">
            Our Expert Tutoring Services
          </h1>
          <p className="services-subtitle mt-3">
            Choose a subject and watch a quick introduction video, then book a
            demo class with the best tutor for your needs.
          </p>
        </div>

        <div className="row g-4">
          {services.map((s, idx) => (
            <div className="col-lg-4 col-md-6" key={idx}>
              <div className="service-card h-100">
                <div className="service-video-box">
                  {playingIndex === idx ? (
                    <iframe
                      className="service-video-frame"
                      src={s.video}
                      title={s.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div
                      className="service-video-thumb"
                      onClick={() => setPlayingIndex(idx)}
                    >
                      <img src={s.thumb} alt={s.title} />
                      <div className="service-play-btn">
                        <i className="fa fa-play"></i>
                      </div>
                    </div>
                  )}
                </div>

                <div className="service-card-body">
                  <div className="service-card-icon">
                    <i className={`fa ${s.icon}`}></i>
                  </div>

                  <h4 className="mt-3 mb-2">{s.title}</h4>
                  <p className="service-desc mb-4">{s.desc}</p>

                  <div className="d-flex gap-2">
                   <Link to="/appointment" className="btn btn-primary rounded-pill px-4">
                     Book Demo
                   </Link>
                   <Link to="/contact" className="btn btn-outline-primary rounded-pill px-4">
                     Enquiry
                 </Link>
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

export default ServiceComponent;
