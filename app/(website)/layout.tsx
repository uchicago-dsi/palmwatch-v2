import { Inter } from "next/font/google";
import queryClient from "@/utils/getMillData";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import path from "path";
import { Feedback } from "@/components/Feedback";
import { Analytics } from "@vercel/analytics/react";
import cmsClient from "@/sanity/lib/client";
export const metadata = {
  title: "PalmWatch",
  description: "Explore the impact of palm oil production on deforestation",
};

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
      <body className={inter.variable}>
        <NavBar searchList={searchList} currentPage="" footerContent={footerContent}>
          {children}
          <Analytics />
        </NavBar>
        <Feedback />
      </body>
    </html>
  );
}
