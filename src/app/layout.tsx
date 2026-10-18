import type { Metadata } from "next";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics";
export const metadata: Metadata = {
  title: {
    default: "Russia Student Hub — একসঙ্গে, নতুন গন্তব্যে",
    template: "%s | Russia Student Hub",
  },
  description:
    "রাশিয়ায় পড়তে যাওয়ার প্রস্তুতি, ভিসা অভিজ্ঞতা ও নিজের যাত্রার তথ্য—এক জায়গায়।",
  icons: {
    icon: [
      { url: "/icon", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>
        <GoogleAnalytics />
        <a className="skip-link" href="#content">
          মূল অংশে যান
        </a>
        <div id="content">{children}</div>
      </body>
    </html>
  );
}
