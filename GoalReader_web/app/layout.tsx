import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050b14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://goalbook.app'),
  title: "GoalBook — AI-Powered Speed Reading & Vocal Teleprompter",
  description: "Experience effortless speed reading with smart two-column academic paper extraction, synchronized karaoke word highlighting from 100-500 WPM, and Gemini AI assistant.",
  keywords: [
    "GoalBook",
    "PDF speed reader",
    "vocal karaoke reading",
    "academic paper OCR",
    "Gemini AI reading assistant",
    "dyslexia friendly reader",
    "speech synthesis teleprompter"
  ],
  authors: [{ name: "GoalBook Engineering Team" }],
  creator: "GoalBook Technologies",
  publisher: "GoalBook Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "GoalBook — Transform Any PDF Into An Interactive Vocal Book",
    description: "Multi-column scientific paper parsing, word-by-word karaoke tracking, AI-powered chapter summaries, and offline library access.",
    siteName: "GoalBook",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoalBook — AI-Powered Speed Reading & Vocal Teleprompter",
    description: "Read books and research papers 3x faster with synchronized vocal pacing and AI assistance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'GoalBook',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2400',
  },
  description:
    'AI-powered speed reader and teleprompter with multi-column research paper parsing, karaoke word synchronization, and Gemini AI assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} font-sans h-full antialiased dark`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-[#050b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
