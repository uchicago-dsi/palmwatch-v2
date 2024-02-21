import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Feedback } from "@/components/Feedback";
import { Analytics } from "@vercel/analytics/react";
import cmsClient from "@/sanity/lib/client";
import Head from "next/head";
import { Footer } from "@/components/Footer";

const VERCEL_DOMAIN = `${
  process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""
}`;

export const metadata = {
  title: "PalmWatch: Tracking the impact of Big Brands' Palm Oil Use",
  description:
    "PalmWatch is an innovative open-access platform leveraging advanced data science and open-source intelligence to map the global palm oil supply chain's impact, connecting major brands like Nestlé, PepsiCo, and Unilever to deforestation and environmental changes.",
  keywords:
    "PalmWatch, palm oil, deforestation, environmental impact, data science, open-source intelligence, global supply chain, Nestlé, PepsiCo, Unilever",
  robots: "index, follow",
  metadataBase: new URL(`${VERCEL_DOMAIN}/`),
  openGraph: {
    url: `${VERCEL_DOMAIN}`,
    title: "PalmWatch:  Tracking the impact of Big Brands' Palm Oil Use",
    description:
      "Discover how major brands' palm oil use drives deforestation and environmental change with PalmWatch, an open-access tool powered by data science and open-source intelligence.",
    images: {
      url: `${VERCEL_DOMAIN}/og-image.png`,
      width: "1200",
      height: "630",
      alt: "PalmWatch: Tracking the impact of Big Brands' Palm Oil Use",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "PalmWatch: Tracking the impact of Big Brands' Palm Oil Use",
    description:
      "PalmWatch reveals the environmental footprint of global palm oil consumption by brands like Nestlé, PepsiCo, and Unilever through advanced data analysis.",
    images: {
      url: `${VERCEL_DOMAIN}/og-image.png`,
      width: "1200",
      height: "630",
      alt: "PalmWatch: Tracking the impact of Big Brands' Palm Oil Use",
    },
    site: "@inclusivedevt",
    creator: "@inclusivedevt",
  },
};
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
