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
    <div className="min-h-screen bg-gray-50">
      {/* filter bar (server form; submits via URL) */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <form action="/" method="get" className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, city, genre…"
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>
          <select name="region" defaultValue={region} className="rounded-xl border bg-white px-3 py-2">
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <input type="hidden" name="page" value="1" />
          <button className="rounded-xl bg-black px-3 py-2 text-white md:col-start-3">Search</button>
        </form>
      </section>

      {/* results grid */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-3 text-sm text-gray-600">
          Found <span className="font-medium">{count}</span> band{count !== 1 ? 's' : ''} • Page {cur} / {totalPages}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((b: BandRow) => (
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
            />
          ))}
        </div>

        {/* pagination */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={mkUrl(Math.max(1, cur - 1))}
            aria-disabled={cur <= 1}
            className={`rounded-lg border px-3 py-1.5 ${cur <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
          >
            ← Prev
          </Link>
          <span className="text-sm text-gray-600">Page {cur} / {totalPages}</span>
          <Link
            href={mkUrl(Math.min(totalPages, cur + 1))}
            aria-disabled={cur >= totalPages}
            className={`rounded-lg border px-3 py-1.5 ${cur >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
          >
            Next →
          </Link>
        </div>
      </section>
    </div>
  )
}
