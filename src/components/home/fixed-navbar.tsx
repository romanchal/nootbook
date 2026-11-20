"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  BookOpen,
  GraduationCap,
  Briefcase,
  Wallet,
  Shield,
  HelpCircle,
  Search,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

/**
 * Fixed Top Navigation Bar with Responsive Hamburger Menu
 * Follows Corporate & Professional style with royal blue (#3B82F6) highlights.
 */
export function FixedNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "#branches", label: "Departments", icon: GraduationCap },
    { href: "#papers", label: "Exam Papers", icon: BookOpen },
    { href: "#marketplace", label: "Marketplace", icon: Briefcase },
    { href: "#wallet", label: "Wallet", icon: Wallet },
    { href: "#pricing", label: "Access Tiers", icon: Shield },
    { href: "#faqs", label: "FAQs", icon: HelpCircle },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800"
          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border-b border-slate-100 dark:border-slate-800/50"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & College Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">📖</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Nootbook
                </span>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  PBCOE
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Autonomous Campus Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-1"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
                <span>{link.label}</span>
              </a>
            );
          })}

          {/* Admin Consoles Dropdown */}
          <div className="relative ml-1">
            <button
              onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
              onBlur={() => setTimeout(() => setAdminDropdownOpen(false), 200)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50/60 transition-colors cursor-pointer"
              aria-expanded={adminDropdownOpen}
            >
              <span>🏛️ Consoles</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {adminDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-xl ring-1 ring-black/5 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                <Link
                  href="/admin/college"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700"
                >
                  <span className="text-base">🏛️</span>
                  <div>
                    <div className="font-bold">College Admin</div>
                    <div className="text-[10px] text-slate-500">
                      PBCOE autonomous branches
                    </div>
                  </div>
                </Link>
                <Link
                  href="/admin/super"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 mt-1"
                >
                  <span className="text-base">👑</span>
                  <div>
                    <div className="font-bold">Super Admin</div>
                    <div className="text-[10px] text-slate-500">
                      Platform governance
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#hero-search"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Papers</span>
          </a>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs shadow-blue-600/30 hover:shadow-md hover:scale-[1.02] transition-all"
          >
            <span>Launch Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white"
          >
            Portal
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col bg-white dark:bg-slate-950 p-6 overflow-y-auto lg:hidden animate-in slide-in-from-top-4 duration-200 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Campus Sections
            </span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-900 hover:text-blue-600"
                >
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{link.label}</span>
                </a>
              );
            })}

            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Governance Consoles
            </span>
            <Link
              href="/admin/college"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50"
            >
              <span>🏛️</span>
              <span>College Admin (PBCOE)</span>
            </Link>
            <Link
              href="/admin/super"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50"
            >
              <span>👑</span>
              <span>Platform Super Admin</span>
            </Link>

            <div className="mt-4 flex flex-col gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/30"
              >
                Sign In to College Account
              </Link>
              <Link
                href="/library"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl border border-blue-200 py-3 text-sm font-bold text-blue-700 dark:text-blue-300"
              >
                Open Academic Library
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
