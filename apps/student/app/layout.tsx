import type { Metadata, Viewport } from "next";
import { Montserrat, Noto_Sans_Devanagari } from "next/font/google";
import { LocaleProvider } from "./_components/locale-provider";
import { ProfileProvider } from "./_components/profile/profile-provider";
import { DocumentsProvider } from "./_components/documents/documents-provider";
import { ApplicationsProvider } from "./_components/apply/applications-provider";
import { ScrutinyBridgeProvider } from "./_components/scrutiny-bridge/scrutiny-bridge-provider";
import "./globals.css";

const montserrat = Montserrat({
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
  title: "HP Admissions — Student",
  description:
    "SwiftChat mini app for undergraduate admissions to Himachal Pradesh government colleges.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1f45d8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--color-background-subtle)]">
        <LocaleProvider>
          <ProfileProvider>
            <DocumentsProvider>
              <ApplicationsProvider>
                <ScrutinyBridgeProvider>{children}</ScrutinyBridgeProvider>
              </ApplicationsProvider>
            </DocumentsProvider>
          </ProfileProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
