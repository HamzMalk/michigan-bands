import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function PATCH(req: Request) {
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
    if (!auth?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

    const body = await req.json()
    const id = body.id
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const updates: Record<string, unknown> = {}
    if (typeof body.name === 'string') {
      const name = body.name.trim()
      if (!name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      updates.name = name
      updates.slug = toSlug(name)
    }
    if (typeof body.city === 'string') updates.city = body.city.trim()
    if (typeof body.region === 'string') updates.region = body.region.trim()
    if (Array.isArray(body.genres)) updates.genres = body.genres.map(String)
    if (body.links && typeof body.links === 'object') updates.links = body.links

    const { data, error } = await supabase
      .from('bands')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, band: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
