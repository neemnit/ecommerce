import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "./ReduxProvider";
import NavbarWrapper from "./components/NavbarWrapper";
import LayoutWrapper from "./components/LayoutWrapper"; // Import the new wrapper
import { Suspense } from "react"; // Import Suspense

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce app",
  description: "It is an online ecommerce app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <NavbarWrapper />
          {/* Wrap children in Suspense globally */}
          <Suspense fallback={<div>Loading...</div>}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Suspense>
        </ReduxProvider>
      </body>
    </html>
  );
}
