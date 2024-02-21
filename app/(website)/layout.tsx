import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Feedback } from "@/components/Feedback";
import { Analytics } from "@vercel/analytics/react";
import cmsClient from "@/sanity/lib/client";
import Head from "next/head";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const revalidate = 60;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const footerContent = await cmsClient.getFooterContent();
  return (
    <html lang="en" data-theme="lemonade">
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

    <title>
      PalmWatch: Tracking the impact of Big Brands&#x27; Palm Oil Use
    </title>
    <meta
      name="description"
      content="PalmWatch is an innovative open-access platform leveraging advanced data science and open-source intelligence to map the global palm oil supply chain&#x27;s impact, connecting major brands like Nestlé, PepsiCo, and Unilever to deforestation and environmental changes."
    />
    <meta
      name="keywords"
      content="PalmWatch, palm oil, deforestation, environmental impact, data science, open-source intelligence, global supply chain, Nestlé, PepsiCo, Unilever"
    />
    <meta name="metadataBase" content="https://www.palmwatch.inclusivedevelopment.net/" /> 
    <meta name="robots" content="index, follow" />
    <meta
      property="og:title"
      content="PalmWatch:  Tracking the impact of Big Brands&#x27; Palm Oil Use"
    />
    <meta
      property="og:description"
      content="Discover how major brands&#x27; palm oil use drives deforestation and environmental change with PalmWatch, an open-access tool powered by data science and open-source intelligence."
    />
    <meta
      property="og:url"
      content="https://www.palmwatch.inclusivedevelopment.net/"
    />
    <meta
      property="og:image"
      content="https://www.palmwatch.inclusivedevelopment.net/og-image.png"
    />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta
      property="og:image:alt"
      content="PalmWatch: Tracking the impact of Big Brands&#x27; Palm Oil Use"
    />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@inclusivedevt" />
    <meta name="twitter:creator" content="@inclusivedevt" />
    <meta
      name="twitter:title"
      content="PalmWatch: Tracking the impact of Big Brands&#x27; Palm Oil Use"
    />
    <meta
      name="twitter:description"
      content="PalmWatch reveals the environmental footprint of global palm oil consumption by brands like Nestlé, PepsiCo, and Unilever through advanced data analysis."
    />
    <meta
      name="twitter:image"
      content="https://www.palmwatch.inclusivedevelopment.net/og-image.png"
    />
    <meta name="twitter:image:width" content="1200" />
    <meta name="twitter:image:height" content="630" />
    <meta
      name="twitter:image:alt"
      content="PalmWatch: Tracking the impact of Big Brands&#x27; Palm Oil Use"
    />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="48x48" />
        
      </Head>
      <body className={inter.variable}>
        <NavBar />
        {children}
        <Footer footerContent={footerContent} />
        <Analytics />
        <Feedback />
      </body>
    </html>
  );
}
