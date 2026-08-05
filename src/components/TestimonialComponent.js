function TestimonialComponent() {
    const testimonials = [
        {
            name: "Riya Mehta",
            role: "Parent",
            image: "img/testimonial-1.jpg",
            text: "City Tutor Hub has transformed my child's learning experience. The tutors are patient, knowledgeable, and make learning fun!",
        },
        {
            name: "Aditya Singh",
            role: "Student",
            image: "img/testimonial-2.jpg",
            text: "I improved my math and science scores dramatically after joining City Tutor Hub. Highly recommended!",
        },
        {
            name: "Meera Joshi",
            role: "Student",
            image: "img/testimonial-3.jpg",
            text: "The tutors at City Tutor Hub are amazing! They explain concepts clearly and provide personalized attention.",
        },
    ];

    return (
        <div className="container-fluid py-5">
            <div className="container">
                <div className="text-center mx-auto mb-5" style={{ maxWidth: "500px" }}>
                    <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
                        Testimonials
                    </h5>
                    <h1 className="display-4">What Students & Parents Say</h1>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="owl-carousel testimonial-carousel">
                            {testimonials.map((item, index) => (
                                <div className="testimonial-item text-center px-4" key={index}>
                                    
                                    {/* Name and role ऊपर */}
                                    <h3 className="mb-1">{item.name}</h3>
                                    <h6 className="fw-normal text-primary mb-4">{item.role}</h6>

                                    {/* Image */}
                                    <div className="position-relative d-inline-block mb-4">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="rounded-circle border border-3 border-primary shadow-sm"
                                            style={{
                                                width: "170px",
                                                height: "170px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <div
                                            className="position-absolute top-100 start-50 translate-middle d-flex align-items-center justify-content-center bg-white rounded-circle shadow"
                                            style={{ width: "50px", height: "50px" }}
                                        >
                                            <i className="fa fa-quote-left text-primary"></i>
                                        </div>
                                    </div>

                                    {/* Testimonial text */}
                                    <p className="fs-5 fw-normal mt-4">
                                        "{item.text}"
                                    </p>

                                    <hr className="w-25 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestimonialComponent;