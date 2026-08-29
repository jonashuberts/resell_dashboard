import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";

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
      <body className="bg-[#050507] text-zinc-100 antialiased font-sans">
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
