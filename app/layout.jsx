import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";


export const metadata = {
  title: "Ilé Surulere — Property & Resident Registry",
  description:
    "A demo registry for Surulere Local Government: property owners list their houses and tenants, CDA members verify on the ground, and LG Staff keep one trustworthy record.",
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Roboto+Slab:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}