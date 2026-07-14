import type { Metadata } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/firebase/auth-context";
import QuickIntakeLauncher from "@/components/quick-intake-launcher";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aid Compass — Find the disaster aid you actually qualify for",
  description:
    "Answer a few plain questions about what the storm damaged. Aid Compass gives you a ranked list of disaster aid programs you're eligible for in western North Carolina — with deadlines, documents, and a direct link to each application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <QuickIntakeLauncher />
        </AuthProvider>
      </body>
    </html>
  );
}
