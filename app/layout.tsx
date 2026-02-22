import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/shared/NavBar";
import AddContactModal from "@/components/shared/AddContactModal";

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
    <html lang="en" className="dark">
      <body className="font-sans bg-gray-950 text-white antialiased">
        <NavBar />
        {children}
        <AddContactModal />
      </body>
    </html>
  );
}
