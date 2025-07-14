import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Scribe - AI-Powered Changelog System",
  description: "Ancient wisdom meets modern development. Generate intelligent changelogs from your git commits using AI.",
  keywords: ["changelog", "git", "AI", "development", "automation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-amber-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
