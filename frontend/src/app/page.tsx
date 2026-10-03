import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      <Hero />
      <TrustStrip />
    </main>
  );
}
