import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "AI Stack for Edit desk (ASED) — CyberMedia",
  description: "AI Stack for Edit desk (ASED) — Transform press releases into publication-quality editorial content for Dataquest, Voice&Data, and PCquest.",
  icons: {
    icon: "/feviconicon.webp",
    shortcut: "/feviconicon.webp",
    apple: "/feviconicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
