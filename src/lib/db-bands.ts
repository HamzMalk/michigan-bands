import { supabaseServer } from './supabase'

export type BandRow = {
  id: string | number
  name: string
  city: string | null
  region: string | null
  genres: string[] | null
  links: Record<string, unknown> | null
  photo_url: string | null
  slug?: string | null
  user_id?: string | null
}

export async function listBands(opts?: {
  q?: string
  region?: string
  page?: number
  pageSize?: number
}) {
  const page = Math.max(1, opts?.page ?? 1)
  const pageSize = Math.min(60, Math.max(6, opts?.pageSize ?? 18))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const sb = supabaseServer()
  let q = sb
    .from('bands')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(from, to)

  if (opts?.region && opts.region !== 'All Regions') {
    q = q.eq('region', opts.region)
  }
  if (opts?.q?.trim()) {
    const needle = `%${opts.q.trim()}%`
    q = q.or(`name.ilike.${needle},city.ilike.${needle},region.ilike.${needle}`)
  }

  const { data, error, count } = await q
  if (error) {
    console.error('[listBands] error:', error)
    return { data: [] as BandRow[], count: 0, page, pageSize }
  }
  return { data: (data ?? []) as BandRow[], count: count ?? 0, page, pageSize }
}

export async function getBandById(id: string) {
  const sb = supabaseServer()
  const maybeNum = Number(id)
  const idValue = Number.isFinite(maybeNum) ? maybeNum : id
  const { data, error } = await sb.from('bands').select('*').eq('id', idValue).single()
  if (error) return null
  return data as BandRow
}

export async function getBandBySlug(slug: string) {
  const sb = supabaseServer()
  const { data, error } = await sb.from('bands').select('*').eq('slug', slug).single()
  if (error) return null
  return data as BandRow
}
