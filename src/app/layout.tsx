import type { Metadata } from "next";
import { Martian_Mono } from "next/font/google";

import "@/app/globals.css";

const martianMono = Martian_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Terminal",
  description: "Decentralized web terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`flex w-full bg-neutral-900 text-white text-xs md:text-sm p-2 ${martianMono.className}`}>
        {children}
      </body>
    </html>
  );
}
