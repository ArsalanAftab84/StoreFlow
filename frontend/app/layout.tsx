import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./Components/Navbar";
import CartSidebar from "./Components/CartSidebar";

const themeScript = `
  (function () {
    var saved = localStorage.getItem('good-stuff-theme');
    document.documentElement.dataset.theme = saved || 'light';
  })();
`;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI E-Commerce Platform",
  description: "Extensive microservices storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <Navbar />
        <CartSidebar />
        {children}
      </body>
    </html>
  );
}
