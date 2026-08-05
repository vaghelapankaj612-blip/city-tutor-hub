import ContactComponent from "../components/ContactComponent";
import FooterComponent from "../components/FooterComponent";
import HeaderComponent from "../components/HeaderComponent";
import NavbarComponent from "../components/NavbarComponent";

function Contact(){
    return(
        <div>
            <HeaderComponent/>
            <NavbarComponent/>
            <ContactComponent/>
            <FooterComponent/>
        </div>
    );
}
export default Contact;