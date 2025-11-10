import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) { cookieStore.set(name, value, options) },
        remove(name: string, options: any) { cookieStore.set(name, '', { ...options, maxAge: 0 }) },
      },
    }
  )

  // Exchange the auth code from the URL for a session and set cookies
  await supabase.auth.exchangeCodeForSession(request.url)

  const url = new URL(request.url)
  const next = url.searchParams.get('next') ?? '/'
  const redirectTo = new URL(next, url.origin)
  return NextResponse.redirect(redirectTo)
}
