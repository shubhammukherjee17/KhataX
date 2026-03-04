import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KhataX - Business Management",
  description: "Comprehensive desktop-first business management web application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-white selection:bg-[#00ea77] selection:text-black bg-[#0a0a0a]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
