import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Head from "next/head";
import { Feedback } from "@/components/feedback";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { NavBar } from "@/features/site-nav";
import { getCanonicalSiteOrigin, getUmamiConfig } from "@/lib/server/site";
import shellStyles from "./_shell/site-shell.module.css";

const siteOrigin = getCanonicalSiteOrigin();

export const metadata = {
  title: "PalmWatch: Tracking the Impact of Big Brands' Palm Oil Use",
  description:
    "PalmWatch is an innovative open-access platform leveraging advanced data science and open-source intelligence to map the global palm oil supply chain's impact, connecting major brands like Nestlé, PepsiCo, and Unilever to deforestation and environmental changes.",
  keywords:
    "PalmWatch, palm oil, deforestation, environmental impact, data science, open-source intelligence, global supply chain, Nestlé, PepsiCo, Unilever",
  robots: "index, follow",
  metadataBase: new URL(`${siteOrigin}/`),
  openGraph: {
    url: `${siteOrigin}`,
    title: "PalmWatch:  Tracking the Impact of Big Brands' Palm Oil Use",
    description:
      "Discover how major brands' palm oil use drives deforestation and environmental change with PalmWatch, an open-access tool powered by data science and open-source intelligence.",
    images: {
      url: `${siteOrigin}/og-image.png`,
      width: "1200",
      height: "630",
      alt: "PalmWatch: Tracking the Impact of Big Brands' Palm Oil Use",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "PalmWatch: Tracking the Impact of Big Brands' Palm Oil Use",
    description:
      "PalmWatch reveals the environmental footprint of global palm oil consumption by brands like Nestlé, PepsiCo, and Unilever through advanced data analysis.",
    images: {
      url: `${siteOrigin}/og-image.png`,
      width: "1200",
      height: "630",
      alt: "PalmWatch: Tracking the Impact of Big Brands' Palm Oil Use",
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
  const umami = getUmamiConfig();
  return (
    <html data-theme="light" lang="en" suppressHydrationWarning>
      <Head>
        <link
          href="/apple-touch-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <link href="/site.webmanifest" rel="manifest" />
        <link color="#5bbad5" href="/safari-pinned-tab.svg" rel="mask-icon" />
        <meta content="#da532c" name="msapplication-TileColor" />
        <meta content="#1d232a" name="theme-color" />
      </Head>
      <body className={inter.variable}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}`,
          }}
        />
        {umami ? (
          <Script
            data-website-id={umami.websiteId}
            defer
            src={umami.scriptSrc}
            strategy="afterInteractive"
          />
        ) : null}
        <ThemeProvider>
          <div className={shellStyles.siteShell}>
            <NavBar />
            <div className={shellStyles.siteMain}>{children}</div>
            <Footer />
          </div>
          <Feedback />
        </ThemeProvider>
      </body>
    </html>
  );
}
