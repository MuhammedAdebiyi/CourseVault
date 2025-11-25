import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../app/components/NavBar";
import Footer from "../app/components/Footer";
import { AuthProvider } from "../src/context/AuthContext";

export const metadata: Metadata = {
  title: "CourseVault",
  description: "Your secure platform for managing course materials",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar showBottomNav={true} />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
