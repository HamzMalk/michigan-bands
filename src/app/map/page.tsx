// src/app/map/page.tsx
import { listBands } from '@/lib/db-bands'

type Search = { q?: string; region?: string }

export const metadata = { title: 'Band Map • Michigan Bands' }

export default async function MapPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams
  const q = (sp.q ?? '').toString()
  const region = (sp.region ?? '').toString()
  // Fetch a generous page to approximate "all" for the map
  const { data } = await listBands({ q, region, page: 1, pageSize: 500 })

  const minimal = data.map((b) => ({
    id: b.id,
    name: b.name,
    city: b.city ?? undefined,
    region: b.region ?? undefined,
    slug: b.slug ?? undefined,
  }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Michigan Band Map</h1>
      <div className="card p-3">
        <MapClient bands={minimal} />
      </div>
    </div>
  )
}

// Client map component (client-only)
import MapClient from './MapClient'
