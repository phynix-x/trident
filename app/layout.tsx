import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TRIDENT | Equipment Rental & Project Solutions',
  description: 'Trident Trinity Assets Private Limited — equipment rental and project solutions.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}