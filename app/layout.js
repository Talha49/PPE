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

export const metadata = {
  // Basic Meta Tags
  title: {
    default: "PPE Sentry - AI-Powered Construction Safety Monitoring",
    template: "%s | PPE Sentry"
  },
  description: "Enterprise-grade PPE compliance monitoring with real-time AI detection. Automated safety enforcement for construction sites, warehouses, and industrial facilities. 99.9% accuracy, instant alerts, GDPR compliant.",
  keywords: ["PPE detection", "construction safety", "AI monitoring", "safety compliance", "RTSP camera", "real-time detection", "worker safety", "industrial safety", "automated compliance", "safety AI"],
  
  // Author & Creator
  authors: [{ name: "SafeGuard AI" }],
  creator: "SafeGuard AI",
  publisher: "SafeGuard AI",
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ppesentry.com',
    siteName: 'PPE Sentry',
    title: 'PPE Sentry - AI-Powered Construction Safety Monitoring',
    description: 'Enterprise-grade PPE compliance monitoring with real-time AI detection. 99.9% accuracy, instant alerts, 24/7 automated safety enforcement.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PPE Sentry - AI Safety Monitoring Dashboard',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'PPE Sentry - AI-Powered Construction Safety',
    description: 'Real-time PPE detection with 99.9% accuracy. Automated compliance monitoring for construction & industrial sites.',
    images: ['/twitter-image.png'],
    creator: '@safeguardai',
  },
  
  // Robots & Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  
  // App Configuration
  applicationName: 'PPE Sentry',
  appleWebApp: {
    capable: true,
    title: 'PPE Sentry',
    statusBarStyle: 'black-translucent',
  },
  
  // Theme & Colors
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#18181b' }
  ],
  
  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  
  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  // Manifest
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
