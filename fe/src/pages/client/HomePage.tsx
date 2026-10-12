import HeroBanner from "@/components/client/HeroBanner";
import ServicesSection from "@/components/client/ServiceSection";
import FareSection from "@/components/client/FareSection";
import HowItWorksSection from "@/components/client/HowItWorksSection";
import FaqSection from "@/components/client/FaqSection";
import FloatingContactButtons from "@/components/client/FloatingContactButtons";

const HomePage = () => {
  return (
    <>
      <HeroBanner />
      <ServicesSection />
      <FareSection />
      <HowItWorksSection />
      <FaqSection />
      <FloatingContactButtons />
    </>
  );
};

export default HomePage;
