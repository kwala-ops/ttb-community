import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toronto Tech Brothers — Muslim Entrepreneurs Toronto',
  description: 'A directory of Muslim entrepreneurs, founders, engineers, and operators across Toronto and beyond.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
