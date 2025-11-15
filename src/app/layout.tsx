import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import SignOutButton from '@/components/SignOutButton'
import HeaderTintController from '@/components/HeaderTintController'

export const metadata: Metadata = {
  title: 'Michigan Bands',
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        // No-ops in a server component to avoid write errors
        set() {},
        remove() {},
      },
    }
  )
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <header data-app-header className="sticky top-0 z-10 border-b header-tint backdrop-blur transition-colors">
          <HeaderTintController />
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight">Michigan Bands</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/map" className="rounded-full border border-green-700 text-green-700 px-3 py-1.5 hover:bg-green-50 shadow-sm">Map</Link>
              <Link href="/submit" className="rounded-lg btn-primary px-3 py-1.5">
                Submit a Band
              </Link>
              {user && (
                <Link href="/my-bands" className="rounded-full border border-green-700 text-green-700 px-3 py-1.5 hover:bg-green-50 shadow-sm">My Bands</Link>
              )}
              {user ? (
                <SignOutButton />
              ) : (
                <>
                  <Link href="/sign-in" className="rounded-full border border-green-700 text-green-700 px-3 py-1.5 hover:bg-green-50 shadow-sm">Sign in</Link>
                  <Link href="/sign-up" className="rounded-full border border-green-700 text-green-700 px-3 py-1.5 hover:bg-green-50 shadow-sm">Sign up</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* add top padding so content isn't hidden under sticky header */}
        <main className="pt-2">{children}</main>
      </body>
    </html>
  )
}
