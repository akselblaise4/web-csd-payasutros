import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSD Payasutros — Club Social y Deportivo | Liga B+',
  description: 'Sitio web oficial de CSD Payasutros. Tabla de posiciones, plantel, fixture, galería y más. ¡Somos Payasutros!',
  icons: {
    icon: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#D4213D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Capa 2: Read the cryptographic nonce generated in middleware
  const headersList = headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <html lang="es">
      <head>
        {/* Inject nonce to secure any inline head scripts if needed */}
        <meta property="csp-nonce" content={nonce} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
