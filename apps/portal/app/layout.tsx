import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { ToastProvider } from "@hp-mis/ui";
import { SessionProvider } from "./_components/data/session-provider";
import "./globals.css";

// Noto Sans matches UX4G reference fonts; Devanagari fallback covers Hindi
// strings rendered on the admin side.
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HPU Admission — Admin Portal",
  description:
    "Official admin portal for undergraduate admissions to colleges affiliated to Himachal Pradesh University.",
};

export const viewport: Viewport = {
  themeColor: "#1976d2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
