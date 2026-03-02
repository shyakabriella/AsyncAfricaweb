import Welcome from "./HomePage/Wellcome";
import AboutIntro from "./HomePage/AboutIntro";
import CoreServices from "./HomePage/CoreServices";
import WhyChooseUs from "./HomePage/WhyChooseUs";
import TrainingOverview from "./HomePage/TrainingOverview";
import FeaturedCourses from "./HomePage/FeaturedCourses";
import IndustriesWeServe from "./HomePage/IndustriesWeServe";  
import HowWeWork from "./HomePage/HowWeWork";
import InnovationSection from "./HomePage/InnovationSection";
import ProjectsPreview from "./HomePage/ProjectsPreview";

export default function Home() {
  return (
    <>
      <Welcome />
      <AboutIntro />
        <CoreServices />
        <WhyChooseUs />
        <TrainingOverview />
        <FeaturedCourses />
        <IndustriesWeServe />
        <HowWeWork />
        <InnovationSection />
        <ProjectsPreview />
    </>
  );
}