'use client'
import { useMemo, useState, useEffect, useDeferredValue } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import BandCard from '@/components/BandCard'
import type { BandRow } from '@/lib/db-bands'
import type { Band } from '@/lib/bands'

const REGIONS = [
  'All Regions','Detroit Metro','Ann Arbor','West MI',
  'Lansing/Jackson','Flint/Saginaw','Northern MI','UP',
] as const
const REGION_SET = new Set(REGIONS)

export default function ClientHome({
  initialBands,
  initialQuery = '',
  initialRegion = 'All Regions',
}: {
  initialBands: BandRow[]
  initialQuery?: string
  initialRegion?: string
}) {
  const router = useRouter()
  const params = useSearchParams()

  const [q, setQ] = useState(initialQuery)
  const [region, setRegion] = useState<string>(initialRegion)
  const debouncedQ = useDeferredValue(q) // smoother typing

  // Sync when user uses back/forward or external links
  useEffect(() => {
    const qp = params.get('q') ?? ''
    const rp = params.get('region') ?? 'All Regions'
    if (qp !== q) setQ(qp)
    if (rp !== region && REGION_SET.has(rp as any)) setRegion(rp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  // Push state to URL (250ms debounce via useDeferredValue)
  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedQ.trim()) next.append('q', debouncedQ.trim())
    if (region && region !== 'All Regions') next.append('region', region)
    const qs = next.toString()
    router.replace(qs ? `/?${qs}` : '/', { scroll: false })
  }, [debouncedQ, region, router])

  const filtered = useMemo(() => {
    const needle = debouncedQ.trim().toLowerCase()
    return (initialBands ?? []).filter((b) => {
      const matchesRegion = region === 'All Regions' || b.region === region
      const hay = `${b.name} ${b.city ?? ''} ${b.region ?? ''} ${(b.genres ?? []).join(' ')}`
        .toLowerCase()
      return matchesRegion && (!needle || hay.includes(needle))
    })
  }, [debouncedQ, region, initialBands])

  const toRegion = (r: string | null | undefined): Band['region'] =>
    (REGION_SET.has((r ?? '') as any) ? (r as Band['region']) : 'Detroit Metro')

  const toLinks = (l: Record<string, unknown> | null | undefined): Band['links'] | undefined => {
    if (!l) return undefined
    const obj = l as Record<string, unknown>
    const w = typeof obj['website'] === 'string' ? obj['website'] as string : undefined
    const ig = typeof obj['instagram'] === 'string' ? obj['instagram'] as string : undefined
    const sp = typeof obj['spotify'] === 'string' ? obj['spotify'] as string : undefined
    return { website: w, instagram: ig, spotify: sp }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* filter bar */}
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
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </section>

      {/* results */}
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
