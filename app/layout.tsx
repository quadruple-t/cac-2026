import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aid Compass — Find disaster aid you qualify for",
  description:
    "Aid Compass helps western North Carolina disaster survivors find and apply for the aid programs they're eligible for.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <span aria-hidden className="text-xl">🧭</span>
              <span>Aid Compass</span>
            </Link>
            <Link
              href="/intake"
              className="rounded-full bg-sky-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-800"
            >
              Get started
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-5 py-6 text-xs text-slate-500">
            Aid Compass provides general information to help you find disaster aid.
            It is not a government agency and does not determine eligibility.
            Always confirm details with each program.
          </div>
        </footer>
      </body>
    </html>
  );
}
