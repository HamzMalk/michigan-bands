'use client'

import { useMemo, useState } from 'react'
import SearchBar from '@/components/SearchBar'
import BandCard from '@/components/BandCard'
import type { BandRow } from '@/lib/db-bands'
import type { Band } from '@/lib/bands'

const REGIONS = [
  'All Regions','Detroit Metro','Ann Arbor','West MI',
  'Lansing/Jackson','Flint/Saginaw','Northern MI','UP',
] as const

export default function ClientHome({ initialBands }: { initialBands: BandRow[] }) {
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<string>('All Regions')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (initialBands ?? []).filter((b) => {
      const matchesRegion = region === 'All Regions' || b.region === region
      const hay = `${b.name} ${b.city ?? ''} ${b.region ?? ''} ${(b.genres ?? []).join(' ')}`
        .toLowerCase()
      return matchesRegion && (!needle || hay.includes(needle))
    })
  }, [q, region, initialBands])

  // helpers to coerce DB rows (loose types) into the stricter `Band` shape
  const toRegion = (r: string | null | undefined): Band['region'] => {
    const allowed = [
      'Detroit Metro','Ann Arbor','West MI','Lansing/Jackson','Flint/Saginaw','Northern MI','UP',
    ] as const
    return (allowed.includes(r as Band['region']) ? (r as Band['region']) : 'Detroit Metro')
  }

  const toLinks = (l: Record<string, unknown> | null | undefined): Band['links'] | undefined => {
    if (!l) return undefined
    const obj = l as Record<string, unknown>
    const website = typeof obj['website'] === 'string' ? (obj['website'] as string) : undefined
    const instagram = typeof obj['instagram'] === 'string' ? (obj['instagram'] as string) : undefined
    const spotify = typeof obj['spotify'] === 'string' ? (obj['spotify'] as string) : undefined
    return { website, instagram, spotify }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      </header> */}

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <SearchBar value={q} onChange={setQ} />
          </div>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2"
          >
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-3 text-sm text-gray-600">
          Showing <span className="font-medium">{filtered.length}</span> band{filtered.length !== 1 ? 's' : ''}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BandCard
              key={b.id}
              band={{
                id: b.id,
                name: b.name,
                city: b.city ?? '',
                region: toRegion(b.region),
                genres: b.genres ?? [],
                links: toLinks(b.links),
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
