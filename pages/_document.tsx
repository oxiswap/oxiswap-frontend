// eslint-disable-next-line @next/next/no-document-import-in-page
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en" className="overflow-hidden">
                <Head>
                <meta name="description" content="Lightning-Fast Decentralized Exchange Built On The Fuel Network" />
                <meta name="keywords" content="Ethereum, Web3, Development, Smart Contracts, Vyper, Solidity, EVM, Sway, Fuel, Fuel Network, Swap, Fuelswap, Swayswap, Oxiswap" />
                <meta name="author" content="Oxiswap" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="apple-mobile-web-app-title" content="Blockze" />
                <meta property="og:title" content="Lightning-Fast Decentralized Exchange Built On The Fuel Network" />
                <meta property="og:description" content="Lightning-Fast Decentralized Exchange Built On The Fuel Network" />
                <meta property="og:image" content="/og-image.png" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.oxiswap.com/" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://www.oxiswap.com/html-meta-tags/twitter-tags.png" />
                <meta name="twitter:title" content="Lightning-Fast Decentralized Exchange Built On The Fuel Network" />
                <meta name="twitter:description" content="Lightning-Fast Decentralized Exchange Built On The Fuel Network" />
                <meta name="twitter:creator" content="@oxiswap" />
                <meta name="twitter:site" content="@oxiswap" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="icon" type="image/svg+xml" href="/swapIcon.png" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
                </Head>
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument;