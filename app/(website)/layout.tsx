import { Inter } from "next/font/google";
import queryClient from "@/utils/getMillData";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import path from "path";
import { Feedback } from "@/components/Feedback";
import { Analytics } from "@vercel/analytics/react";
import cmsClient from "@/sanity/lib/client";
import Head from "next/head";

export const metadata = {
  "title": "PalmWatch: Tracking Big Brands' Impact on Palm Oil Use",
  "description": "PalmWatch is an innovative open-access platform leveraging advanced data science and open-source intelligence to map the global palm oil supply chain's impact, connecting major brands like Nestlé, PepsiCo, and Unilever to deforestation and environmental changes.",
  "keywords": "PalmWatch, palm oil, deforestation, environmental impact, data science, open-source intelligence, global supply chain, Nestlé, PepsiCo, Unilever",
  "robots": "index, follow",
  "openGraph": {
    "url": "https://www.palmwatch.inclusivedevelopment.net/",
    "title": "PalmWatch: Tracking Big Brands' Impact on Palm Oil Use",
    "description": "Discover how major brands' palm oil use drives deforestation and environmental change with PalmWatch, an open-access tool powered by data science and open-source intelligence.",
    "images": [
      {
        "url": "https://www.palmwatch.inclusivedevelopment.net/og-image.png",
        "width": 1200,
        "height": 630,
        "alt": "PalmWatch: Tracking Big Brands' Impact on Palm Oil Use"
      }
    ]
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "PalmWatch: Tracking Big Brands' Impact on Palm Oil Use",
    "description": "PalmWatch reveals the environmental footprint of global palm oil consumption by brands like Nestlé, PepsiCo, and Unilever through advanced data analysis.",
    "images": [
      {
        "url": "https://www.palmwatch.inclusivedevelopment.net/og-image.png",
        "width": 1200,
        "height": 630,
        "alt": "PalmWatch: Tracking Big Brands' Impact on Palm Oil Use"
      }
    ],
    "site": "@inclusivedevt",
    "creator": "@inclusivedevt"
  }
}


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const revalidate = 60

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dataDir = path.join(process.cwd(), "public", "data");
  const [_, footerContent] = await Promise.all([
    queryClient.init(dataDir),
    cmsClient.getFooterContent(),
  ]);
  const searchList = queryClient.getSearchList();

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
        <NavBar
          searchList={searchList}
          currentPage=""
          footerContent={footerContent}
        >
          {children}
          <Analytics />
        </NavBar>
        <Feedback />
      </body>
    </html>
  );
}
