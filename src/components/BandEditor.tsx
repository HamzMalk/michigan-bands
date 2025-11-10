'use client'

import { useState } from 'react'
import type { BandRow } from '@/lib/db-bands'

const REGIONS = [
  'Detroit Metro','Ann Arbor','West MI',
  'Lansing/Jackson','Flint/Saginaw','Northern MI','UP',
] as const

export default function BandEditor({ band }: { band: BandRow }) {
  const [name, setName] = useState(band.name)
  const [city, setCity] = useState(band.city ?? '')
  const [region, setRegion] = useState<string>(band.region ?? 'Detroit Metro')
  const [genres, setGenres] = useState<string>((band.genres ?? []).join(', '))
  const [website, setWebsite] = useState<string>(String((band.links as any)?.website ?? ''))
  const [instagram, setInstagram] = useState<string>(String((band.links as any)?.instagram ?? ''))
  const [spotify, setSpotify] = useState<string>(String((band.links as any)?.spotify ?? ''))
  const [status, setStatus] = useState<'idle'|'saving'|'ok'|'error'>('idle')
  const [msg, setMsg] = useState('')

  async function onSave() {
    setStatus('saving'); setMsg('')
    try {
      const payload: any = {
        id: band.id,
        name,
        city,
        region,
        genres: genres.split(',').map(g=>g.trim()).filter(Boolean),
        links: {
          website: website || undefined,
          instagram: instagram || undefined,
          spotify: spotify || undefined,
        },
      }
      const res = await fetch('/api/bands/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Failed to save')
      setStatus('ok'); setMsg('Saved!')
    } catch (e: any) {
      setStatus('error'); setMsg(e?.message ?? 'Error')
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Region</label>
          <select value={region} onChange={(e)=>setRegion(e.target.value)} className="w-full rounded-lg border px-3 py-2">
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Genres (comma-separated)</label>
          <input value={genres} onChange={(e)=>setGenres(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Website</label>
          <input value={website} onChange={(e)=>setWebsite(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Instagram</label>
          <input value={instagram} onChange={(e)=>setInstagram(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Spotify</label>
          <input value={spotify} onChange={(e)=>setSpotify(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button disabled={status==='saving'} onClick={onSave} className="rounded-xl btn-primary px-4 py-2 disabled:opacity-60">
          {status==='saving' ? 'Saving…' : 'Save'}
        </button>
        {status==='ok' && <span className="text-green-700">{msg}</span>}
        {status==='error' && <span className="text-red-600">{msg}</span>}
      </div>
    </div>
  )
}
