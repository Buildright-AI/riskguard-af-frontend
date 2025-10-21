import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import AuthenticatedLayout from "./components/layouts/AuthenticatedLayout";

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
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_G_KEY || ""} />
        <body
          className={`bg-background h-screen w-screen overflow-hidden ${space_grotesk.variable} ${manrope.variable} font-text antialiased flex`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
