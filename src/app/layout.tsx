import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileFrame from "@/components/layout/MobileFrame";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SIMA-NET | Sistem Manajemen Layanan Internet",
  description: "Aplikasi manajemen layanan ISP — pendaftaran, pemasangan, pembayaran, dan pengaduan pelanggan.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#800000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ToastProvider>
            <MobileFrame>{children}</MobileFrame>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
