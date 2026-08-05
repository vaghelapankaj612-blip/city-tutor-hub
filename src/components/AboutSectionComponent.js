function AboutSectionComponent() {
    return (
        <div className="container-fluid py-5">
            <div className="container">
                <div className="row gx-5">
                    <div className="col-lg-5 mb-5 mb-lg-0" style={{ minHeight: "500px" }}>
                        <div className="position-relative h-100">
                            <img
                                className="position-absolute w-100 h-100 rounded"
                                src="img/about.jpg"
                                style={{ objectFit: "cover" }}
                                alt="Students learning"
                            />
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="mb-4">
                            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
                                About Us
                            </h5>
                            <h1 className="display-4">
                                Best Learning Support For Students of Every Age
                            </h1>
                        </div>
                        <p>
                            City Tutor Hub is a trusted platform that connects students with highly
                            qualified and experienced tutors. We believe every student learns
                            differently, so we provide personalized guidance to help them succeed
                            academically and build confidence in their skills. Whether it's school
                            subjects, competitive exam preparation, or skill development, our tutors
                            are here to support every step of the learning journey.
                        </p>

                        <div className="row g-3 pt-3">
                            <div className="col-sm-3 col-6">
                                <div className="bg-light text-center rounded-circle py-4">
                                    <i className="fa fa-3x fa-chalkboard-teacher text-primary mb-3"></i>
                                    <h6 className="mb-0">
                                        Expert
                                        <small className="d-block text-primary">Tutors</small>
                                    </h6>
                                </div>
                            </div>

                            <div className="col-sm-3 col-6">
                                <div className="bg-light text-center rounded-circle py-4">
                                    <i className="fa fa-3x fa-user-graduate text-primary mb-3"></i>
                                    <h6 className="mb-0">
                                        Personalized
                                        <small className="d-block text-primary">Learning</small>
                                    </h6>
                                </div>
                            </div>

                            <div className="col-sm-3 col-6">
                                <div className="bg-light text-center rounded-circle py-4">
                                    <i className="fa fa-3x fa-book-open text-primary mb-3"></i>
                                    <h6 className="mb-0">
                                        All Subjects
                                        <small className="d-block text-primary">Covered</small>
                                    </h6>
                                </div>
                            </div>

                            <div className="col-sm-3 col-6">
                                <div className="bg-light text-center rounded-circle py-4">
                                    <i className="fa fa-3x fa-laptop text-primary mb-3"></i>
                                    <h6 className="mb-0">
                                        Online & Offline
                                        <small className="d-block text-primary">Classes</small>
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutSectionComponent;
