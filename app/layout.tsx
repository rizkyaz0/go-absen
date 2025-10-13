import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Go Absen - Sistem Absensi Karyawan",
  description: "Sistem absensi karyawan yang modern dan efisien untuk meningkatkan produktivitas tim Anda.",
  keywords: ["absensi", "karyawan", "attendance", "hr", "management"],
  authors: [{ name: "Go Absen Team" }],
  creator: "Go Absen",
  publisher: "Go Absen",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://go-absen.com"),
  openGraph: {
    title: "Go Absen - Sistem Absensi Karyawan",
    description: "Sistem absensi karyawan yang modern dan efisien",
    url: "https://go-absen.com",
    siteName: "Go Absen",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Go Absen - Sistem Absensi Karyawan",
    description: "Sistem absensi karyawan yang modern dan efisien",
    creator: "@goabsen",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="go-absen-theme"
        >
          {children}
          <Toaster 
            position="top-right"
            expand={true}
            richColors={true}
            closeButton={true}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
