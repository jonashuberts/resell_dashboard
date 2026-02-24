import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resell Dashboard",
  description: "Modern dashboard to track reselling inventory and finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <LanguageProvider>
          <div className="flex h-screen overflow-hidden">
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
