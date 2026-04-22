import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { ToastProvider } from "@hp-mis/ui";
import { LocaleProvider } from "./_components/locale-provider";
import { ProfileProvider } from "./_components/profile/profile-provider";
import { DocumentsProvider } from "./_components/documents/documents-provider";
import { ApplicationsProvider } from "./_components/apply/applications-provider";
import { ScrutinyBridgeProvider } from "./_components/scrutiny-bridge/scrutiny-bridge-provider";
import { AllotmentBridgeProvider } from "./_components/allotment-bridge/allotment-bridge-provider";
import "./globals.css";

// Noto Sans matches the UX4G reference system and pairs naturally with the
// Devanagari fallback already used for Hindi.
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
  title: "HPU Admission — Student",
  description:
    "SwiftChat mini app for undergraduate admissions to colleges affiliated to Himachal Pradesh University.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1976d2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--color-background)]">
        <LocaleProvider>
          <ToastProvider>
            <ProfileProvider>
              <DocumentsProvider>
                <ApplicationsProvider>
                  <ScrutinyBridgeProvider>
                    <AllotmentBridgeProvider>{children}</AllotmentBridgeProvider>
                  </ScrutinyBridgeProvider>
                </ApplicationsProvider>
              </DocumentsProvider>
            </ProfileProvider>
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
