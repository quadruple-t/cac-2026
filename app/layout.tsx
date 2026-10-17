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
  title: {
    default: "Aid Compass: Hurricane Helene aid, sorted for you",
    template: "%s | Aid Compass",
  },
  description:
    "FEMA, SBA, and North Carolina recovery programs in one place. See what you qualify for, what to bring, and every deadline. Free, and not a government site.",
  applicationName: "Aid Compass",
  keywords: [
    "Hurricane Helene aid",
    "Helene recovery assistance",
    "western North Carolina disaster aid",
    "FEMA Individual Assistance",
    "SBA disaster loan",
    "Disaster SNAP North Carolina",
    "disaster aid deadlines",
  ],
  openGraph: {
    type: "website",
    siteName: "Aid Compass",
    locale: "en_US",
    title: "Aid Compass: Hurricane Helene aid, sorted for you",
    description:
      "Disaster aid is a maze. Aid Compass walks western North Carolina survivors through FEMA, SBA, and state programs, with checklists and deadlines.",
  },
  twitter: {
    card: "summary",
    title: "Aid Compass: Hurricane Helene aid, sorted for you",
    description:
      "Find the Helene recovery programs you qualify for, what to bring, and every deadline. Free.",
  },
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
