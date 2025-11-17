import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { MainLayout } from "@/components/layout/main-layout";
import { ToastProvider } from "@/components/ui/Toast";
import ToastNotifications from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

// Build estático: usar comportamento padrão de rendering

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Drift Brasil - Indústria de Peças Automotivas",
  description: "Fabricante de peças automotivas originais com qualidade e tecnologia. Catálogo completo de peças para seu veículo.",
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: [
      { url: '/favicon/favicon.ico' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Drift Brasil',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff0000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-white text-black`}
      >
        <AuthProvider>
          <ToastProvider>
            <ToastNotifications />
            <MainLayout>
              {children}
            </MainLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
