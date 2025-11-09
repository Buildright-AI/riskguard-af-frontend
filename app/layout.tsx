import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AuthenticatedLayout from "./components/layouts/AuthenticatedLayout";
import { ThemeProvider } from "./components/contexts/ThemeContext";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-text",
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "RiskGuard",
  description: "AI Platform (Builrdight.ai)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en">
        <body
          className={`bg-background h-screen w-screen overflow-hidden ${space_grotesk.variable} ${manrope.variable} font-text antialiased flex`}
        >
          <ThemeProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <AuthenticatedLayout>{children}</AuthenticatedLayout>
            </Suspense>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
