  // Import Components
import HeaderComponent from "../components/HeaderComponent";
import NavbarComponent from "../components/NavbarComponent";
import HeroSection from "../components/HeroSection";
import AboutSectionComponent from "../components/AboutSectionComponent";
import ServicesComponent from "../components/ServicesComponent";
import SearchTeacherComponent from "../components/SearchTeacherComponent";
import AppointmentComponent from "../components/AppointmentComponent";
// import PricingComponent from "../components/PricingComponent";
import TeamComponent from "../components/TeamComponent";
import TestimonialComponent from "../components/TestimonialComponent";
import FooterComponent from "../components/FooterComponent";


function Home() {
  return (
    <>
      <HeaderComponent />
      <NavbarComponent />

      <HeroSection />
      <AboutSectionComponent /> 
      <ServicesComponent />
      
      <AppointmentComponent />
      
      <TeamComponent />
      <SearchTeacherComponent />
      <TestimonialComponent />

      <FooterComponent />
    </>
  );
}

export default Home;
