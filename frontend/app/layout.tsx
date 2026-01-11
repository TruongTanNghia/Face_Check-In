import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Face Attendance System",
  description: "Next-gen Face Recognition Attendance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Main Content */}
          <main className="flex-1 p-8 overflow-y-auto relative">
             {/* Background decorative elements */}
             <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-tech-blue/5 blur-[120px] -z-10 animate-pulse-slow"></div>
             {children}
          </main>
        </div>
      </body>
    </html>
  );
}
