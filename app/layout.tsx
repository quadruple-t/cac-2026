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
  title: "Aid Compass — Support after Hurricane Helene",
  description:
    "Aid Compass helps people in western North Carolina find Hurricane Helene recovery support, deadlines, and official application links.",
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
