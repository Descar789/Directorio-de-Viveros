import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvisoCookies from "@/components/AvisoCookies";
import Analytics from "@/components/Analytics";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: {
    default: "BuscaViveros — Directorio de viveros en México",
    template: "%s | BuscaViveros",
  },
  description:
    "Encuentra viveros cerca de ti. El directorio de viveros más completo de México: plantas, árboles, suculentas y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${poppins.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <Header />
        {children}
        <Footer />
        <AvisoCookies />
        <Analytics />
      </body>
    </html>
  );
}
