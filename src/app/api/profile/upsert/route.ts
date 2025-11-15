import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : null

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
