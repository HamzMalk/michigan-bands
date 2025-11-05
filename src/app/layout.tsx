import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Michigan Bands',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight">Michigan Bands</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/submit" className="rounded-lg bg-black px-3 py-1.5 text-white hover:bg-gray-800">
                Submit a Band
              </Link>
            </nav>
          </div>
        </header>

        {/* add top padding so content isn't hidden under sticky header */}
        <main className="pt-2">{children}</main>
      </body>
    </html>
  )
}