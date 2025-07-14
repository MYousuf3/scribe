import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { HomeIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import Providers from "../components/Providers";
import AuthButton from "../components/AuthButton";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Scribe - AI-Powered Changelog System",
  description: "Ancient wisdom meets modern development. Generate intelligent changelogs from your git commits using AI.",
  keywords: ["changelog", "git", "AI", "development", "automation", "ancient", "clay", "tablet"],
  authors: [{ name: "Scribe Development Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Scribe - AI-Powered Changelog System",
    description: "Ancient wisdom meets modern development. Generate intelligent changelogs from your git commits using AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-clay-light text-ink-dark flex flex-col">
        <Providers>
          {/* Header Navigation */}
          <header className="bg-gradient-to-r from-amber-800 to-orange-900 shadow-lg border-b-4 border-amber-700">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex justify-between items-center h-16">
              {/* Logo and Brand */}
              <Link href="/" className="flex items-center space-x-3 text-white hover:text-amber-200 transition-colors">
                <div className="text-2xl font-serif font-bold">Ψ</div>
                <span className="text-xl font-bold tracking-wide">Scribe</span>
              </Link>

              {/* Center Navigation Links */}
              <div className="flex space-x-8">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-white hover:text-amber-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link 
                  href="/developer" 
                  className="flex items-center space-x-2 text-white hover:text-amber-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  <WrenchScrewdriverIcon className="h-5 w-5" />
                  <span>Developer Tools</span>
                </Link>
              </div>

              {/* Authentication */}
              <AuthButton />
            </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-amber-900 to-orange-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Brand Column */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-serif font-bold">Ψ</div>
                    <span className="text-xl font-bold">Scribe</span>
                  </div>
                  <p className="text-amber-200 text-sm leading-relaxed">
                    Ancient wisdom meets modern development. Transform your git history into meaningful chronicles.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-amber-100">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/" className="text-amber-200 hover:text-white transition-colors">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/developer" className="text-amber-200 hover:text-white transition-colors">
                        Developer Tools
                      </Link>
                    </li>
                    <li>
                      <Link href="/projects" className="text-amber-200 hover:text-white transition-colors">
                        Projects
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* About */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-amber-100">About</h3>
                  <p className="text-amber-200 text-sm leading-relaxed">
                    Scribe transforms your development workflow with AI-powered changelog generation, 
                    bringing the timeless art of record-keeping to modern software development.
                  </p>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-amber-700 mt-8 pt-6 text-center">
                <p className="text-amber-200 text-sm">
                  © 2025 Scribe. Crafted with ancient wisdom and modern technology.
                </p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
