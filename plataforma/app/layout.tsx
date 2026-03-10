import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { AuthHashRedirect } from "@/components/AuthHashRedirect";

const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Educação no Trânsito",
  description: "Plataforma municipal de educação no trânsito para ensino fundamental",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={roboto.variable}>
      <body className="min-h-screen flex flex-col bg-streaming-bg text-streaming-text font-sans" suppressHydrationWarning>
        <Header />
        <AuthHashRedirect />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
