import "./globals.css";
import ClientWrapper from '@components/ClientWrapper';
import { Providers } from '@components/Provider';
import { fonts } from "../../utils/fonts";
import type { Metadata } from 'next';
import Footer from "@components/Footer/Footer";


export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: {
    default: 'OxiSwap - Lightning-Fast DEX powered by Fuel',
    template: '%s | OxiSwap 🐉',
  },
  description: 'Trade, earn, and build on Fuel\'s most oxidized experience',
  keywords: ['DEX', 'cryptocurrency', 'exchange', 'DeFi', 'blockchain', 'OxiSwap', 'Oxi', 'FuelSwap', 'Fuel network', 'fuel token', 'oxi token'],
  authors: [{ name: 'OxiLabs' }],
  creator: 'OxiLabs',
  publisher: 'OxiLabs',
  openGraph: {
    title: 'OxiSwap - Decentralized Exchange',
    description: 'Lightning-Fast Decentralized Exchange Built On The Fuel Network',
    images: [
      {
        url: 'https://images.oxiswap.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OxiSwap - Lightning-Fast DEX powered by Fuel',
      },
    ],
    type: 'website',
    url: 'https://www.oxiswap.com'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@OxiSwap',
    siteId: '1656320604432367617',
    creator: '@OxiSwap',
    creatorId: '1656320604432367617',
    title: 'OxiSwap - Lightning-Fast DEX powered by Fuel',
    description: 'Trade, earn, and build on Fuel\'s most oxidized experience',
    images: [
      {
        url: 'https://images.oxiswap.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OxiSwap - Lightning-Fast DEX powered by Fuel',
      },
    ],
  },
  icons: {
    icon: 'https://images.oxiswap.com/favicon.ico',
    apple: 'https://images.oxiswap.com/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://oxiswap.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`min-h-screen ${fonts.baselGroteskBook.variable} ${fonts.baselGroteskMedium.variable}`}>
      <head>
        <link rel="canonical" href="https://oxiswap.com" />
      </head>
      <body className={`${fonts.inter.className} bg-gradient-to-r from-[#d8e0f2] via-[#f4f6fd] to-[#ece2f3] min-h-screen font-basel-grotesk-book relative`}>
        <Providers>
          <ClientWrapper>
            <div>
              <main>
                {children}
              </main>
              <Footer />
            </div>
          </ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
