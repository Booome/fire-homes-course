import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fire Homes",
  description: "Fire Homes Course Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <Toaster position="top-center" />
        <AuthProvider>
          <Header />
          <main className="flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
