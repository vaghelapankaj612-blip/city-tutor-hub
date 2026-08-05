import AppointmentComponent from "../components/AppointmentComponent";
import FooterComponent from "../components/FooterComponent";
import HeaderComponent from "../components/HeaderComponent";
import NavbarComponent from "../components/NavbarComponent";
import ServiceComponent from "../components/ServicesComponent";
import TestimonialComponent from "../components/TestimonialComponent";

function Service() {
    return (
        <>
            <HeaderComponent/>
            <NavbarComponent/>
            <ServiceComponent/>
            <AppointmentComponent/>
            <TestimonialComponent/>
            <FooterComponent/>
        </>
    );
}

export default Service;
