import { supabaseServer } from './supabase'

export type BandRow = {
  id: string; name: string; city: string|null; region: string|null;
  genres: string[]|null; links: Record<string, unknown>|null; photo_url: string|null;
}

export async function listBands() {
  const sb = supabaseServer()
  const { data, error } = await sb.from('bands').select('*').order('name', { ascending: true })

  if (error) {
    // Log everything we can
    console.error('Supabase bands RAW error:', error)
    try { console.error('JSON:', JSON.stringify(error)) } catch {}
    return [] // keep UI alive while you fix it
  }
  return (data ?? []) as BandRow[]
}
