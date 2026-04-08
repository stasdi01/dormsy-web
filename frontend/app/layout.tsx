import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DormSy — Campus Marketplace",
  description:
    "Buy and sell secondhand items within your college community. Verified students only.",
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
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
