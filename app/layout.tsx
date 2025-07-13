import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ISC | GPA Calculator',
  description: 'Created by Team ISC-Lab-Rats',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
  
      <body>{children}</body>
    </html>
  )
}
