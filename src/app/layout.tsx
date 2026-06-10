import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/fl-2-40-health-study-2026" : "";

export const metadata: Metadata = {
  title: "FL Health & Life Study App",
  description: "Study tool for Florida Health and Life Insurance Exam",
  manifest: `${BASE_PATH}/manifest.json`,
  icons: {
    icon: `${BASE_PATH}/icon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && !['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('${BASE_PATH}/sw.js').then(function(registration) {
                    registration.update();
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
