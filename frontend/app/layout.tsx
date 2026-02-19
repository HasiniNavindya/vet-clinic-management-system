import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  weight: ['500', '700'],
  subsets: ["latin"],
  variable: '--font-heading',
});

const inter = Inter({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: "Carlisle Pet Care - Veterinary Clinic Management System",
  description: "Professional pet care and veterinary services for your beloved pets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
