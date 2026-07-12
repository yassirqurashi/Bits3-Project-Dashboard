import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: "Bits3 Project Dashboard",
  description: "Client and project dashboard for Bits3",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Bits3 Project Dashboard",
    description: "Client and project dashboard for Bits3",
    siteName: "Bits3 Project Dashboard",
    images: [
      {
        url: "/bits3-share.png",
        width: 1200,
        height: 630,
        alt: "Bits3",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bits3 Project Dashboard",
    description: "Client and project dashboard for Bits3",
    images: ["/bits3-share.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
