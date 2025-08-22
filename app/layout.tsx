import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LocationPermissionChecker from "@/components/LocationPermissionChecker";
import dynamic from "next/dynamic";

// Dynamic imports for location components
const LocationEffectComponent = dynamic(() => import('@/components/LocationEffectComponents'));
const DeviceLocationGuard = dynamic(() => import('@/components/DeviceLocationGuard'));

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Sistem Absensi – Berbasis QR & Real-Time Tracking",
  description:
    "Permudah absensi karyawan dengan sistem berbasis QR. Pantau kehadiran real-time, kelola izin, dan buat laporan secara cepat dalam satu platform.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4CAF50" />
        {/* Enhanced PWA capabilities for better mobile experience */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Device and location detection - shows warnings/guidance */}
          <DeviceLocationGuard />

          {/* Enhanced location tracking */}
          <LocationEffectComponent />

          {/* Toast notifications with reduced duration */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 3000, // Reduced from 5000
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
              },
            }}
          />

          {/* Original location permission checker */}
          <LocationPermissionChecker />

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}