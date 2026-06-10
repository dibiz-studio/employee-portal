import { GeistSans } from "geist/font/sans";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { AuthProvider } from "@/features/auth/components/auth-provider";
import { ThemeProvider } from "@/shared/components/theme-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Dibiz Studio – Employee Management Portal",
  description: "Employee management for Dibiz Studio.",
  icons: {
    icon: "/dibiz-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${inter.variable} ${GeistSans.className}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
