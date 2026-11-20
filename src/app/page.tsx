import { Preloader } from "@/components/home/preloader";
import { CustomCursor } from "@/components/home/custom-cursor";
import { FixedNavbar } from "@/components/home/fixed-navbar";
import { SplitHero } from "@/components/home/split-hero";
import { StatsCounter } from "@/components/home/stats-counter";
import { DepartmentsGrid } from "@/components/home/departments-grid";
import { PapersRepository } from "@/components/home/papers-repository";
import { MarketplacePreview } from "@/components/home/marketplace-preview";
import { WalletPreview } from "@/components/home/wallet-preview";
import { PricingTable } from "@/components/home/pricing-table";
import { AdminPortalsSection } from "@/components/home/admin-portals-section";
import { FAQAccordion } from "@/components/home/faq-accordion";
import { ContactForm } from "@/components/home/contact-form";
import { MultiColumnFooter } from "@/components/home/multi-column-footer";
import { BackToTop } from "@/components/home/back-to-top";

/**
 * Nootbook Homepage
 * Academic Library & Exam Paper Hub for PBCOE Autonomous
 * Corporate & Professional styling with Blue (#3B82F6) and White theme.
 */
export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans">
      {/* Client micro-interactions */}
      <Preloader />
      <CustomCursor />
      <BackToTop />

      {/* Fixed Navigation */}
      <FixedNavbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Split Hero Section */}
        <SplitHero />

        {/* 2. Animated Stats Counter */}
        <StatsCounter />

        {/* 3. 8 Engineering Departments Grid */}
        <DepartmentsGrid />

        {/* 4. Official Exam Papers Repository (Term I & II) */}
        <PapersRepository />

        {/* 5. Student Peer Task Marketplace */}
        <MarketplacePreview />

        {/* 6. Student Wallet & Double-Entry Escrow */}
        <WalletPreview />

        {/* 7. Access Tiers & Pricing Table */}
        <PricingTable />

        {/* 8. Separate Governance Consoles */}
        <AdminPortalsSection />

        {/* 9. FAQ Accordion */}
        <FAQAccordion />

        {/* 10. Contact & Student Helpdesk Form */}
        <ContactForm />
      </main>

      {/* Multi-Column Academic Footer */}
      <MultiColumnFooter />
    </div>
  );
}
