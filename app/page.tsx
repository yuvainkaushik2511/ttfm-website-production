import ScrollIndicator from "@/components/layout/ScrollIndicator";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Work from "@/components/sections/Work";
import Pillars from "@/components/sections/Pillars";
import BuildLaunchScale from "@/components/sections/BuildLaunchScale";
import OnSet from "@/components/sections/OnSet";
import Mumbai from "@/components/sections/Mumbai";
import Numbers from "@/components/sections/Numbers";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <ScrollIndicator />
      <Hero />
      <Manifesto />
      <Work />
      <Pillars />
      <BuildLaunchScale />
      <OnSet />
      <Mumbai />
      <Numbers />
      <About />
      <Contact />
    </>
  );
}
