import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/shared/NavBar";
import AddContactModal from "@/components/shared/AddContactModal";

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "dot collector — Personal Network",
  description: "Your personal professional network dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${garamond.variable} ${inter.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">
        <NavBar />
        {children}
        <AddContactModal />
      </body>
    </html>
  );
}
