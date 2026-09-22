import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Foursquare Gospel Church Nigeria — Media Archive",
  description: "Watch and revisit recordings from every service, programme, and gathering at Foursquare Gospel Church Nigeria.",
  openGraph: {
    siteName: "Foursquare Gospel Church Nigeria — Media Archive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}