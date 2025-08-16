import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LocationPermissionChecker from "@/components/LocationPermissionChecker"; // ⬅️ import

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#4CAF50" />

      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" reverseOrder={false} />
          <LocationPermissionChecker /> {/* ⬅️ tambahkan di sini */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
