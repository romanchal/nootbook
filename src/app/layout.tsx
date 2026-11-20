import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

// Configure Plus Jakarta Sans for headings
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Configure Inter for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nootbook — Academic Library & Exam Paper Hub for PBCOE Autonomous",
  description:
    "An official academic platform and student marketplace for Priyadarshini Bhagwati College of Engineering, Nagpur. Features branch-wise curricula, semester exam papers with Bloom's taxonomy marking, and peer task collaboration.",
  keywords: [
    "PBCOE",
    "Priyadarshini Bhagwati College of Engineering",
    "Nagpur Autonomous",
    "Semester 3 Exam Papers",
    "Bloom's Taxonomy",
    "Engineering Question Papers",
    "Artificial Intelligence PBCOE",
    "Student Task Marketplace",
    "Nootbook",
  ],
  authors: [{ name: "PBCOE Student Community & Antigravity" }],
  creator: "PBCOE Autonomous Campus",
  publisher: "Nootbook Academic Network",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://nootbook-pied.vercel.app",
    title: "Nootbook — Academic Library & Exam Paper Hub for PBCOE Autonomous",
    description:
      "Official autonomous repository for Priyadarshini Bhagwati College of Engineering, Nagpur. Term I & II question papers with Bloom's taxonomy marking.",
    siteName: "Nootbook",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nootbook — Academic Library & Exam Paper Hub for PBCOE Autonomous",
    description:
      "Official autonomous repository for Priyadarshini Bhagwati College of Engineering, Nagpur. Term I & II question papers with Bloom's taxonomy marking.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
