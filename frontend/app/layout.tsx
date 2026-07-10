import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import EmergencyFloatingButton from "@/components/layout/EmergencyFloatingButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carlisle Pet Care",
  description: "Veterinary Clinic Management System",
  icons: {
    icon: "/images/newlogo1.png",
    apple: "/images/newlogo1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans antialiased pt-30 md:pt-38">
        <AuthProvider>
          {children}
          <EmergencyFloatingButton />
        </AuthProvider>
      </body>
    </html>
  );
}
