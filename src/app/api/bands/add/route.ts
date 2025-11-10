import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(req: Request) {
  // SSR Supabase client bound to request cookies, so we can read the user
  const cookieStore = await cookies()
  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: any) {
        cookieStore.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })

  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

    const body = await req.json()
    const name = String(body.name ?? '').trim()
    const city = String(body.city ?? '').trim()
    const region = String(body.region ?? '').trim()
    const genres = Array.isArray(body.genres) ? body.genres.map(String) : []
    const links = typeof body.links === 'object' && body.links !== null ? body.links : {}

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = toSlug(name)

    const { error } = await supabase.from('bands').insert({
      name,
      city,
      region,
      genres,
      links,
      slug,
      user_id: user.id,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
