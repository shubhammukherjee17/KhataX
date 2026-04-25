import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: '--font-manrope',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "GononaX - Business Management",
  description: "Comprehensive desktop-first business management web application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} ${inter.className} antialiased text-white selection:bg-[#00FFA3] selection:text-black bg-[#0A0A0A]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
