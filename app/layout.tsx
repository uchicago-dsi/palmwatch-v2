import { MultiSearch } from "@/components/MutliSearch";
import { Inter } from "next/font/google";
import Link from "next/link";
import queryClient from "@/utils/getMillData";
import "./globals.css";

export const metadata = {
  title: "PalmWatch",
  description: "A simple Next.js app with Vercel Blob for image uploads",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchList = queryClient.getSearchList();

  return (
    <html lang="en">
      <body className={inter.variable}>
        {/* align flex to top */}
        <div className="navbar bg-base-100 align-top justify-start items-start max-h-12 overflow-visible">
          <div className="flex-1">
            <Link href="/" className="btn btn-ghost normal-case text-xl">palmwatch</Link>
          </div>
          <div className="flex-none">
            <div className="flex flex-row space-x-2">
              <MultiSearch options={searchList} />
              <Link href="/about" className="flex py-3 px-0">
                about
              </Link>
              <Link href="/contact" className="flex py-3 px-0">
                contact
              </Link>
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
