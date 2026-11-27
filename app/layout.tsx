import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./nav";
import AuthRecoveryListener from "./AuthRecoveryListener";
import NotificationBell from "@/components/NotificationBell";
import EnregistrementPush from "@/components/EnregistrementPush";
import BoutonRetour from "@/components/BoutonRetour";
import BoutonPreferences from "@/components/BoutonPreferences";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project End Zone",
  description: "Pronostics NFL entre amis",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon-180.png",
  },
  appleWebApp: {
    capable: true,
    title: "End Zone",
    statusBarStyle: "black",
  },
  openGraph: {
    title: "Project End Zone",
    description: "Pronostics NFL entre amis",
    images: ["/og-image-final.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1420",
  // L'écran va jusqu'aux bords : les marges de l'iPhone sont gérées dans globals.css
  viewportFit: "cover",
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
          <AuthRecoveryListener />
          <div style={{ paddingTop: "var(--marge-haut)", paddingBottom: "calc(70px + var(--marge-bas))" }}>{children}</div>
          {/* Bandeau uni sous l'heure et la batterie : la page défile derrière */}
          <div
            aria-hidden="true"
            style={{ position: "fixed", top: 0, left: 0, right: 0, height: "var(--marge-haut)", background: "#0d1420", zIndex: 210, pointerEvents: "none" }}
          />
          <Nav />
          <NotificationBell />
          <EnregistrementPush />
          <BoutonRetour />
          <BoutonPreferences />
          <Analytics />
        </body>
    </html>
  );
}