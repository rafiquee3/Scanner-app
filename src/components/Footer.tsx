"use client";

import NextLink from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-800 bg-[#1E2938]">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <span className="font-bold text-xl font-outfit text-white tracking-tight">
                Smart Scanner
              </span>
            </div>
            <p className="text-gray-500 text-xs">© {currentYear} Smart Scanner</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Features</h4>
              <nav className="flex flex-col gap-3">
                <NextLink
                  href="/"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Scan Receipt
                </NextLink>
                <NextLink
                  href="/receipts"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  My Collection
                </NextLink>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Support</h4>
              <nav className="flex flex-col gap-3">
                <NextLink
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Feedback
                </NextLink>
                <NextLink
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Privacy Policy
                </NextLink>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
