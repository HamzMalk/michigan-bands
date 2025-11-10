'use client'

import { useState } from 'react'

const REGIONS = [
  'Detroit Metro','Ann Arbor','West MI',
  'Lansing/Jackson','Flint/Saginaw','Northern MI','UP',
] as const

export default function SubmitForm() {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState<(typeof REGIONS)[number]>('Detroit Metro')
  const [genres, setGenres] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [spotify, setSpotify] = useState('')
  const [status, setStatus] = useState<'idle'|'saving'|'ok'|'error'>('idle')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving'); setMsg('')
    const payload = {
      name,
      city,
      region,
      genres: genres.split(',').map(g => g.trim()).filter(Boolean),
      links: {
        website: website || undefined,
        instagram: instagram || undefined,
        spotify: spotify || undefined,
      }
    }

    const res = await fetch('/api/admin/add-band', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const json = await res.json()
    if (!res.ok) { setStatus('error'); setMsg(json.error ?? 'Failed'); return }
    setStatus('ok'); setMsg('Submitted! 🎉')
    setName(''); setCity(''); setRegion('Detroit Metro'); setGenres('')
    setWebsite(''); setInstagram(''); setSpotify('')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Submit a Band</h1>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Band Name *</label>
          <input value={name} onChange={e=>setName(e.target.value)} required className="w-full rounded-lg border px-3 py-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input value={city} onChange={e=>setCity(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Region</label>
            <select value={region} onChange={e=>setRegion(e.target.value as any)} className="w-full rounded-lg border px-3 py-2">
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Genres (comma-separated)</label>
          <input value={genres} onChange={e=>setGenres(e.target.value)} placeholder="Indie Rock, Dream Pop" className="w-full rounded-lg border px-3 py-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Website</label>
            <input value={website} onChange={e=>setWebsite(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Instagram</label>
            <input value={instagram} onChange={e=>setInstagram(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Spotify</label>
            <input value={spotify} onChange={e=>setSpotify(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </div>
        </div>

        <button disabled={status==='saving'} className="rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60">
          {status==='saving' ? 'Submitting…' : 'Submit'}
        </button>

        {status==='ok' && <p className="text-green-700">{msg}</p>}
        {status==='error' && <p className="text-red-600">{msg}</p>}
      </form>
    </div>
  )
}
