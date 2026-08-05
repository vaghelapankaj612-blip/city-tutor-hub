import AppointmentComponent from "../components/AppointmentComponent";
import FooterComponent from "../components/FooterComponent";
import HeaderComponent from "../components/HeaderComponent";
import NavbarComponent from "../components/NavbarComponent";

function Appointment(){
    return(
        <div>
            <HeaderComponent/>
            <NavbarComponent/>
            <AppointmentComponent/>
            <FooterComponent/>
        </div>
    );
}

export default Appointment;