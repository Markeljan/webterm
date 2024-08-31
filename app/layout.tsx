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
      <body
        className={`bg-neutral-900 text-cyan-300 min-w-max text-xs md:min-w-full p-2 md:text-base ${martianMono.className}`}
      >
        {children}
      </body>
    </html>
  );
}
