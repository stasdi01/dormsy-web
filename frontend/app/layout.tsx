import type { Metadata } from "next";
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
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
