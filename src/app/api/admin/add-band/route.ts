import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // minimal validation
    const name = String(body.name ?? '').trim()
    const city = String(body.city ?? '').trim()
    const region = String(body.region ?? '').trim()
    const genres = Array.isArray(body.genres) ? body.genres.map(String) : []
    const links = typeof body.links === 'object' && body.links !== null ? body.links : {}

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    // service role bypasses RLS; keep this ONLY on the server
    const admin = createClient(url, service)
    const { error } = await admin.from('bands').insert({
      name, city, region,
      genres,
      links,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
