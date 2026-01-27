import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MapContextProvider } from "@/components/Map/context/MapContext";
import GlobalConnectionManager from "@/components/Map/context/GlobalConnectionManager";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EdgeWARN",
  description: "EdgeWARN Interactive Weather Map",
  icons: {
    icon: "/assets/EdgeWARN.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <MapContextProvider>
          <GlobalConnectionManager />
          {children}
        </MapContextProvider>
      </body>
    </html>
  );
}
