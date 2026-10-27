import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cool Wanderer — AI Social Media Itinerary Generator",
  description:
    "Cool Wanderer mengubah video TikTok, Instagram Reels, & YouTube Shorts menjadi jadwal itinerary harian terstruktur dan peta rute interaktif.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body
        className={`${plusJakartaSans.className} bg-surface text-body-md text-on-surface antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
