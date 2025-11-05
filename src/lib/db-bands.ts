import { supabaseServer } from './supabase'

export type BandRow = {
  id: string
  name: string
  city: string | null
  region: string | null
  genres: string[] | null
  links: Record<string, unknown> | null
  photo_url: string | null
}

/** List bands with optional client-side text filter and region filter */
export async function listBands(opts?: { region?: string; q?: string }) {
  const sb = supabaseServer()

  // base query
  let query = sb.from('bands').select('*').order('name', { ascending: true })
  if (opts?.region && opts.region !== 'All Regions') {
    query = query.eq('region', opts.region)
  }

  const { data, error } = await query
  if (error) {
    console.error('[bands] Supabase error:', {
      message: error.message, details: (error as any).details, hint: (error as any).hint, code: (error as any).code
    })
    return [] as BandRow[]
  }

  const rows = (data ?? []) as BandRow[]

  // optional local text filter
  if (opts?.q?.trim()) {
    const needle = opts.q.toLowerCase()
    return rows.filter(b => {
      const hay = `${b.name} ${b.city ?? ''} ${b.region ?? ''} ${(b.genres ?? []).join(' ')}`
        .toLowerCase()
      return hay.includes(needle)
    })
  }

  return rows
}

export async function getBandById(id: string) {
  const sb = supabaseServer()
  const { data, error } = await sb.from('bands').select('*').eq('id', id).single()
  if (error) return null
  return data as BandRow
}

export async function getBandBySlug(slug: string) {
  const sb = supabaseServer()
  const { data, error } = await sb.from('bands').select('*').eq('slug', slug).single()
  if (error) return null
  return data as BandRow
}
