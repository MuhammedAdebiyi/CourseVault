import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import './globals.css';
import { AuthProvider } from "../src/context/AuthContext"; 

export const metadata = {
  title: 'CourseVault',
  description: 'Organize your course PDFs easily',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black font-sans">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
