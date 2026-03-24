// ─────────────────────────────────────────────────────────────────────────────
// ROOT LAYOUT — SCIAGEN APP
// ─────────────────────────────────────────────────────────────────────────────
import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { AuthProvider }     from '@/components/auth/AuthProvider';
import { ThemeProvider }    from '@/components/layout/ThemeProvider';
import { Navbar }           from '@/components/layout/Navbar';
import { BreakingTicker }   from '@/components/layout/BreakingTicker';
import { Footer }           from '@/components/layout/Footer';
import { IntroAnimation }   from '@/components/layout/IntroAnimation';
import { Toaster }          from 'react-hot-toast';

const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sciagen.com';
const APP_NAME = 'Sciagen';
const APP_DESC = 'The global science knowledge platform. Real-time research, breakthroughs, and discovery across every domain of science.';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default:  `${APP_NAME} — Global Science Platform`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESC,
  applicationName: APP_NAME,
  authors: [{ name: 'Sciagen Editorial', url: APP_URL }],
  keywords: [
    'science', 'research', 'AI', 'healthcare', 'physics',
    'biology', 'space', 'technology', 'genomics', 'neuroscience',
    'science news', 'science magazine', 'research papers',
  ],
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         APP_URL,
    siteName:    APP_NAME,
    title:       `${APP_NAME} — Global Science Platform`,
    description: APP_DESC,
    images: [{
      url:    '/og-default.jpg',
      width:  1200,
      height: 630,
      alt:    'Sciagen — Global Science Platform',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    site:        '@sciagen',
    creator:     '@sciagen',
    title:       `${APP_NAME} — Global Science Platform`,
    description: APP_DESC,
    images:      ['/og-default.jpg'],
  },
  robots: {
    index:           true,
    follow:          true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  icons: {
    icon:        [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
    apple:       '/apple-touch-icon.png',
    shortcut:    '/favicon-16x16.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: APP_URL,
    types:     { 'application/rss+xml': `${APP_URL}/feed.xml` },
  },
};

export const viewport: Viewport = {
  width:              'device-width',
  initialScale:       1,
  maximumScale:       5,
  themeColor:         [
    { media: '(prefers-color-scheme: dark)',  color: '#070d12' },
    { media: '(prefers-color-scheme: light)', color: '#f8f9fa' },
  ],
  colorScheme:        'dark light',
};

// ── JSON-LD for the whole site ────────────────────────────────────────────────

const organizationJsonLd = {
  '@context':    'https://schema.org',
  '@type':       'Organization',
  name:          APP_NAME,
  url:           APP_URL,
  logo:          `${APP_URL}/logo.png`,
  sameAs: [
    'https://twitter.com/sciagen',
    'https://linkedin.com/company/sciagen',
  ],
  description:   APP_DESC,
};

const websiteJsonLd = {
  '@context':          'https://schema.org',
  '@type':             'WebSite',
  name:                APP_NAME,
  url:                 APP_URL,
  potentialAction: {
    '@type':       'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${APP_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// ── Root Layout ───────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for font performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>

      <body className="font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>
          <AuthProvider>
            {/* Intro animation (shown once per session) */}
            <IntroAnimation />

            {/* Breaking news ticker */}
            <BreakingTicker />

            {/* Main navigation */}
            <Navbar />

            {/* Main content */}
            <main className="min-h-screen pt-[var(--navbar-height)]">
              {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Toast notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-elevated)',
                  color:      'var(--text-primary)',
                  border:     '1px solid var(--border-default)',
                  fontFamily: 'var(--font-sans)',
                  fontSize:   '14px',
                },
                success: {
                  iconTheme: { primary: '#06d0f5', secondary: '#040608' },
                },
                error: {
                  iconTheme: { primary: '#ff3d57', secondary: '#040608' },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
