import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quản lý tài chính",
  description: "Quản lý tài chính cá nhân",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.className}`} suppressHydrationWarning>
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}

