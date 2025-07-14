import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Providers from "../components/Providers";
import AuthButton from "../components/AuthButton";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Scribe - Chronicle of Changes",
  description: "Transform your git history into beautiful, meaningful changelogs with ancient wisdom and modern AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-light_beige text-dark_brown flex flex-col">
        <Providers>
          {/* Header Navigation */}
          <header className="bg-dark_brown shadow-lg border-b-4 border-accent_red">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo and Brand */}
                <Link href="/" className="flex items-center space-x-3 text-cream hover:text-golden_brown transition-colors">
                  <div className="text-2xl font-bold text-cream">𒂷</div>
                  <span className="text-xl font-bold text-cream font-serif">Scribe</span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center space-x-6">
                  <Link
                    href="/developer"
                    className="text-cream hover:text-golden_brown transition-colors duration-300 font-medium"
                  >
                    Developer
                  </Link>
                  
                  {/* Authentication */}
                  <AuthButton />
                </div>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-dark_brown text-cream py-8 border-t-4 border-accent_red">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="text-2xl">𒀭</div>
                <span className="text-lg font-bold font-serif">Scribe</span>
              </div>
              <p className="text-golden_brown mb-4">
                Chronicle of Changes • Ancient wisdom for modern repositories
              </p>
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-cream hover:text-golden_brown transition-colors">
                  Documentation
                </a>
                <a href="#" className="text-cream hover:text-golden_brown transition-colors">
                  Support
                </a>
                <a href="#" className="text-cream hover:text-golden_brown transition-colors">
                  Community
                </a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
