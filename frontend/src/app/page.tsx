import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { TwoEnginesSection } from "@/components/landing/TwoEnginesSection";
import { DecisionFlowSection } from "@/components/landing/DecisionFlowSection";
import { ScamCoverageSection } from "@/components/landing/ScamCoverageSection";
import { ExplainableByDesignSection } from "@/components/landing/ExplainableByDesignSection";
import { MuleGraphSection } from "@/components/landing/MuleGraphSection";
import { LoanEarlyWarningSection } from "@/components/landing/LoanEarlyWarningSection";
import { RoiCalculatorSection } from "@/components/landing/RoiCalculatorSection";
import { SelfLearningLoopSection } from "@/components/landing/SelfLearningLoopSection";
import { ComplianceSection } from "@/components/landing/ComplianceSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col selection:bg-[#E2E8F0] selection:text-[#1F2430]">
      <Navbar />
      <Hero />
      <TrustStrip />
      <ProblemSection />
      <TwoEnginesSection />
      <DecisionFlowSection />
      <ScamCoverageSection />
      <ExplainableByDesignSection />
      <MuleGraphSection />
      <LoanEarlyWarningSection />
      <RoiCalculatorSection />
      <SelfLearningLoopSection />
      <ComplianceSection />
      <FinalCtaSection />
      <FooterSection />
    </main>
  );
}
