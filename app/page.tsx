import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Motivation } from "@/components/landing/Motivation";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Motivation />
      <Footer />
    </>
  );
}
