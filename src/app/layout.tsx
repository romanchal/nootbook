import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nootbook",
  description:
    "Academic library and peer-to-peer task marketplace for college students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
