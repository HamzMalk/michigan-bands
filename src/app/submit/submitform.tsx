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

  // Simple URL normalizers and canonicalizers for friendlier input
  const normUrl = (u: string | undefined | null) => {
    const raw = (u ?? '').trim()
    if (!raw) return ''
    try {
      const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)
      return new URL(hasScheme ? raw : `https://${raw}`).toString()
    } catch {
      return raw // keep as-is; server will ignore if invalid
    }
  }

  const canonicalInstagram = (u: string | undefined | null) => {
    const raw = (u ?? '').trim()
    if (!raw) return ''
    const lower = raw.toLowerCase()
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
      return normUrl(raw)
    }
    const handle = raw.startsWith('@') ? raw.slice(1) : raw
    if (/^[a-zA-Z0-9._]+$/.test(handle)) {
      return `https://instagram.com/${handle}`
    }
    return normUrl(raw)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving'); setMsg('')
    const payload = {
      name,
      city,
      region,
      genres: genres.split(',').map(g => g.trim()).filter(Boolean),
      links: {
        website: normUrl(website) || undefined,
        instagram: canonicalInstagram(instagram) || undefined,
        spotify: normUrl(spotify) || undefined,
      }
    }

    const res = await fetch('/api/bands/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const json = await res.json()
    if (!res.ok) {
      if (res.status === 401) { setStatus('error'); setMsg('Please sign in to submit a band.'); return }
      setStatus('error'); setMsg(json.error ?? 'Failed'); return
    }
    setStatus('ok'); setMsg('Submitted! 🎉')
    setName(''); setCity(''); setRegion('Detroit Metro'); setGenres('')
    setWebsite(''); setInstagram(''); setSpotify('')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Submit a Band</h1>
      <form onSubmit={onSubmit} className="card grid gap-4 p-6 animate-rise">
        <div>
          <label className="mb-1 block text-sm font-medium">Band Name *</label>
          <input value={name} onChange={e=>setName(e.target.value)} required className="input w-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input value={city} onChange={e=>setCity(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Region</label>
            <select value={region} onChange={e=>setRegion(e.target.value as any)} className="select w-full">
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Genres (comma-separated)</label>
          <input value={genres} onChange={e=>setGenres(e.target.value)} placeholder="Indie Rock, Dream Pop" className="input w-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Website</label>
            <input
              value={website}
              onChange={e=>setWebsite(e.target.value)}
              onBlur={() => setWebsite(normUrl(website))}
              placeholder="https://example.com"
              className="input w-full"
            />
            {website && normUrl(website) && normUrl(website) !== website.trim() && (
              <p className="mt-1 text-xs text-gray-600">Will save as {normUrl(website)}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Instagram</label>
            <input
              value={instagram}
              onChange={e=>setInstagram(e.target.value)}
              onBlur={() => setInstagram(canonicalInstagram(instagram))}
              placeholder="@yourband or instagram.com/yourband"
              className="input w-full"
            />
            {instagram && canonicalInstagram(instagram) && canonicalInstagram(instagram) !== instagram.trim() && (
              <p className="mt-1 text-xs text-gray-600">Will save as {canonicalInstagram(instagram)}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Spotify</label>
            <input
              value={spotify}
              onChange={e=>setSpotify(e.target.value)}
              onBlur={() => setSpotify(normUrl(spotify))}
              placeholder="https://open.spotify.com/artist/..."
              className="input w-full"
            />
            {spotify && normUrl(spotify) && normUrl(spotify) !== spotify.trim() && (
              <p className="mt-1 text-xs text-gray-600">Will save as {normUrl(spotify)}</p>
            )}
          </div>
        </div>

        <button disabled={status==='saving'} className="rounded-xl btn-primary px-4 py-2 disabled:opacity-60 shadow-sm">
          {status==='saving' ? 'Submitting…' : 'Submit'}
        </button>

        {status==='ok' && <p className="text-green-700">{msg}</p>}
        {status==='error' && <p className="text-red-600">{msg}</p>}
      </form>
    </div>
  )
}
