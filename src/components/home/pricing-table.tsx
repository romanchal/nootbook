"use client";

import Link from "next/link";
import { Check, Shield, Sparkles, ArrowRight } from "lucide-react";

interface PricingTier {
  name: string;
  badge: string;
  price: string;
  period: string;
  description: string;
  isPopular: boolean;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

const TIERS: PricingTier[] = [
  {
    name: "Student Library",
    badge: "Free Forever",
    price: "₹0",
    period: "always free for students",
    description:
      "Full academic access for all students of Priyadarshini Bhagwati College of Engineering, Nagpur.",
    isPopular: true,
    features: [
      "Access to all 8 PBCOE Engineering branches",
      "7 Official Semester 3 Term I & II Exam Papers",
      "Full Bloom's Taxonomy (BL1-BL5) question mapping",
      "Course Outcomes (CO1-CO4) syllabus alignment",
      "High-speed printable exam sheet viewer",
      "Consolidated PDF paper downloads",
    ],
    ctaText: "Browse Academic Library",
    ctaLink: "/library",
  },
  {
    name: "Student Earner",
    badge: "0% Platform Cut",
    price: "₹0",
    period: "no registration fees",
    description:
      "Earn money by assisting peers with lab record formatting, seminar PPTs, and study notes.",
    isPopular: false,
    features: [
      "Browse and claim campus task requests",
      "Double-entry escrow protection for payouts",
      "Zero hidden platform deduction on earnings",
      "Campus earner reputation badge",
      "Instant payout requests via UPI/Bank transfer",
      "Admin-backed dispute protection",
    ],
    ctaText: "Start Earning as Student",
    ctaLink: "/earner",
  },
  {
    name: "College Department Admin",
    badge: "Autonomous Faculty",
    price: "Institutional",
    period: "campus authorized access",
    description:
      "Curate syllabus, upload upcoming term exam papers, and moderate branch library materials.",
    isPopular: false,
    features: [
      "Department status control (Active vs Coming Soon)",
      "Upload and verify Term I & II question papers",
      "Manage subject codes & Bloom's criteria",
      "Approve student notes submissions",
      "Role-based Class & College Admin permissions",
      "Direct synchronization with Autonomous Board",
    ],
    ctaText: "College Admin Console",
    ctaLink: "/admin/college",
  },
];

export function PricingTable() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Shield className="h-3.5 w-3.5" />
            <span>Fair &amp; Open Access</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Access Tiers &amp; Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Nootbook is built primarily for student empowerment. Official academic archives are 100% free, while marketplace bounties operate on secure double-entry escrow.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                tier.isPopular
                  ? "bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02]"
                  : "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs"
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  Most Popular for Students
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    {tier.name}
                  </h3>
                  <span className="rounded-md bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    {tier.badge}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    {tier.period}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {tier.description}
                </p>

                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Included Features:
                  </div>
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={tier.ctaLink}
                  className={`flex items-center justify-center gap-2 w-full rounded-xl py-3 text-xs font-bold transition-all ${
                    tier.isPopular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30"
                      : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
