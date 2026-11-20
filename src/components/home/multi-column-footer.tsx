"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

// Inline lightweight SVG icons for social platforms
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function MultiColumnFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & College Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold">
                📖
              </div>
              <span className="font-heading text-xl font-extrabold text-white">
                Nootbook
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Official academic repository and peer task platform for Priyadarshini Bhagwati College of Engineering, Nagpur (AUTONOMOUS). Designed for student excellence, verifiable exam records, and collaborative campus learning.
            </p>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div>📍 Harpur Nagar, Umrer Road, Nagpur, Maharashtra 440024</div>
              <div>🏛️ Autonomous Academic Cell · Affiliated to Nagpur Board</div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/romanchal/nootbook"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter Community"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="#contact"
                aria-label="Community Support"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: 8 Engineering Branches */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
              Engineering Branches
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  href="/library/ai"
                  className="hover:text-blue-400 flex items-center gap-1.5 font-bold text-blue-400"
                >
                  <span>Artificial Intelligence (AI)</span>
                  <span className="rounded bg-blue-900/60 text-[9px] px-1 text-blue-300">
                    LIVE
                  </span>
                </Link>
              </li>
              <li>
                <span className="hover:text-white">Computer Science &amp; Eng.</span>
              </li>
              <li>
                <span className="hover:text-white">Information Technology</span>
              </li>
              <li>
                <span className="hover:text-white">Electrical Engineering</span>
              </li>
              <li>
                <span className="hover:text-white">Electronics &amp; Communication</span>
              </li>
              <li>
                <span className="hover:text-white">Electronics &amp; Telecom</span>
              </li>
              <li>
                <span className="hover:text-white">Civil Engineering</span>
              </li>
              <li>
                <span className="hover:text-white">Mechanical Engineering</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Papers & Syllabi */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
              Official Papers
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#papers" className="hover:text-white">
                  Semester 3 Term I Papers
                </a>
              </li>
              <li>
                <a href="#papers" className="hover:text-white">
                  Semester 3 Term II Papers
                </a>
              </li>
              <li>
                <Link
                  href="/library/paper/res-pbcoe-ds-term1"
                  className="hover:text-white"
                >
                  Data Structure (AI301T)
                </Link>
              </li>
              <li>
                <Link
                  href="/library/paper/res-pbcoe-java-term1"
                  className="hover:text-white"
                >
                  Java OOP (BAID302T)
                </Link>
              </li>
              <li>
                <Link
                  href="/library/paper/res-pbcoe-eco-term1"
                  className="hover:text-white"
                >
                  Operating System (BAID303T)
                </Link>
              </li>
              <li>
                <Link
                  href="/library/paper/res-pbcoe-evs-term2"
                  className="hover:text-white"
                >
                  Applied Mathematics III (BCAD301T)
                </Link>
              </li>
              <li>
                <a
                  href="/papers/PBCOE-Semester-3-Consolidated-Exam-Papers.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Download Consolidated PDF ↓
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Portals & Governance */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
              Campus Portals
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  href="/admin/college"
                  className="hover:text-blue-400 flex items-center gap-1"
                >
                  <span>🏛️</span>
                  <span>College Admin Console</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/super"
                  className="hover:text-indigo-400 flex items-center gap-1"
                >
                  <span>👑</span>
                  <span>Super Admin Console</span>
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-white">
                  Academic Library
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="hover:text-white">
                  Task Marketplace
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-white">
                  Student Escrow Wallet
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Interactive Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Accreditation */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Nootbook · Priyadarshini Bhagwati College of Engineering, Nagpur (AUTONOMOUS). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#faqs" className="hover:text-slate-400">
              Examination Guidelines
            </a>
            <span>•</span>
            <a href="#faqs" className="hover:text-slate-400">
              Bloom&apos;s Taxonomy Standards
            </a>
            <span>•</span>
            <a href="#contact" className="hover:text-slate-400">
              Academic Integrity
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
