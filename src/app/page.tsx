// src/app/page.tsx
import { listBands } from '@/lib/db-bands'
import type { Band } from '@/lib/bands'
import type { BandRow } from '@/lib/db-bands'
import Link from 'next/link'
import BandCard from '@/components/BandCard'

type Search = { q?: string; region?: string; page?: string }

const REGIONS = [
  'All Regions', 'Detroit Metro', 'Ann Arbor', 'West MI',
  'Lansing/Jackson', 'Flint/Saginaw', 'Northern MI', 'UP',
] as const

const REGION_SET = new Set<string>(REGIONS as readonly string[])

const toRegion = (r: string | null): Band['region'] =>
  (REGION_SET.has((r ?? '') as any) ? (r as Band['region']) : 'Detroit Metro')

const toLinks = (l: Record<string, unknown> | null | undefined): Band['links'] | undefined => {
  if (!l) return undefined
  const obj = l as Record<string, unknown>
  const website = typeof obj['website'] === 'string' ? (obj['website'] as string) : undefined
  const instagram = typeof obj['instagram'] === 'string' ? (obj['instagram'] as string) : undefined
  const spotify = typeof obj['spotify'] === 'string' ? (obj['spotify'] as string) : undefined
  return { website, instagram, spotify }
}

export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams
  const q = (sp.q ?? '').toString()
  const region = (sp.region ?? 'All Regions').toString()
  const page = Number(sp.page ?? '1') || 1

  const { data, count, page: cur, pageSize } =
    await listBands({ q, region, page, pageSize: 18 })

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const mkUrl = (p: number) => {
    const sp = new URLSearchParams()
    if (q.trim()) sp.set('q', q.trim())
    if (region && region !== 'All Regions') sp.set('region', region)
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return qs ? `/?${qs}` : '/'
  }

  return (
    <div className="min-h-screen">
      {/* filter bar (server form; submits via URL) */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="card p-6 animate-rise">
        <form action="/" method="get" className="grid gap-4 md:grid-cols-3">
          <div className="input-wrap md:col-span-2">
            <svg className="icon-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 104.207 12.03l4.256 4.257a.75.75 0 101.06-1.06l-4.257-4.257A6.75 6.75 0 0010.5 3.75zm-5.25 6.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, city, genre…"
              className="input input-shimmer with-icon w-full"
            />
          </div>
          <select name="region" defaultValue={region} className="select w-full">
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <input type="hidden" name="page" value="1" />
          <button className="rounded-xl btn-primary px-3 py-2 md:col-start-3 shadow-sm">Search</button>
        </form>
        </div>
      </section>

      {/* results grid */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-3 text-sm text-gray-600">
          Found <span className="font-medium">{count}</span> band{count !== 1 ? 's' : ''} • Page {cur} / {totalPages}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((b: BandRow, i) => (
            <BandCard
              key={b.id}
              band={{
                id: b.id,
                name: b.name,
                city: b.city ?? '',
                region: toRegion(b.region),
                genres: b.genres ?? [],
                links: toLinks(b.links),
                slug: b.slug ?? null,
              }}
              // slight stagger via inline style
              style={{ animationDelay: `${i * 40}ms` } as React.CSSProperties}
            />
          ))}
        </div>

        {/* pagination */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={mkUrl(Math.max(1, cur - 1))}
            aria-disabled={cur <= 1}
            className={`chip-primary rounded-full px-3 py-1.5 ${cur <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            ← Prev
          </Link>
          <span className="text-sm text-gray-600">Page {cur} / {totalPages}</span>
          <Link
            href={mkUrl(Math.min(totalPages, cur + 1))}
            aria-disabled={cur >= totalPages}
            className={`chip-primary rounded-full px-3 py-1.5 ${cur >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
          >
            Next →
          </Link>
        </div>
      </section>
    </div>
  )
}
