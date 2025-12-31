import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '../components/sidebar';
import { Providers } from '../provider/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VOX | AI Voice & Sound Generation',
  description:
    'AI platform for Text-to-Speech, Voice Conversion, and Sound Effect generation. Privacy-focused.',
  icons: {
    icon: [
      {
        url: '/favicon_io/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon_io/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      { url: '/favicon_io/favicon.ico' },
    ],
    apple: [{ url: '/favicon_io/apple-touch-icon.png' }],
  },
  manifest: '/favicon_io/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}  antialiased`}>
        <Providers>
          <div className="w-full h-screen text-foreground flex overflow-hidden">
            <Sidebar />
            <main className=" flex-1 min-w-0 flex flex-col relative ">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
