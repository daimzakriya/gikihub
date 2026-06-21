import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: {
    default:  "GIKI Plus",
    template: "%s | GIKI Plus",
  },
  description:
    "Everything GIK, in your pocket. Room finder, GPA calculator, professor reviews, campus memories, and more.",
  manifest:    "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "GIKI Plus" },
  openGraph: {
    type:        "website",
    siteName:    "GIKI Plus",
    title:       "GIKI Plus",
    description: "Everything GIK, in your pocket.",
  },
};

export const viewport: Viewport = {
  themeColor:    "#0a2540",
  width:         "device-width",
  initialScale:  1,
  maximumScale:  1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}