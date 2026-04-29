import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "DormSy — Campus Marketplace",
  description:
    "Buy and sell secondhand items within your college community. Verified students only.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DormSy",
  },
  openGraph: {
    title: "DormSy — Campus Marketplace",
    description:
      "Buy and sell secondhand items within your college community. Verified students only.",
    siteName: "DormSy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#00599B" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5Y5VJHHCDY"
          strategy="afterInteractive"
        />
        <Script src="/ga.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
