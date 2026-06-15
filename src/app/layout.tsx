import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Cairo } from 'next/font/google'
import './globals.css'
import { cookies } from 'next/headers'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

export const metadata: Metadata = {
  title: 'ALLO MAMA — Connectez-vous à la vie de votre enfant',
  description: 'Plateforme de communication entre parents et crèches',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('allo-mama-locale')?.value === 'ar' ? 'ar' : 'fr'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.variable} ${cairo.variable}`} style={{ fontFamily: "var(--font-inter), 'Segoe UI', sans-serif" }}>
        <LanguageProvider initialLocale={locale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}