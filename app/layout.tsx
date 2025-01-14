import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StateProvider } from "@/providers/state-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amonos",
  description: "Casino Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StateProvider>
          {children}
          <ToastProvider />
        </StateProvider>
      </body>
    </html>
  );
}
