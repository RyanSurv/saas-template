import { Companies } from "@/app/_components/companies";
import { Contact } from "@/app/_components/contact";
import { Features } from "@/app/_components/features";
import { Hero } from "@/app/_components/hero";
import { Pricing } from "@/app/_components/pricing";

export default function Home() {
  return (
    <main>
      <Hero />
      <Companies />
      <Features />
      <Pricing />
      <Contact />
    </main>
  );
}
