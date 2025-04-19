import './globals.css'
import { RootLayoutClient } from './_components/root-layout-client'

export const metadata = {
  title: '10x Healthcare',
  description: 'Healthcare platform for better patient care',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  )
}
