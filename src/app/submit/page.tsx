// src/app/page.tsx
import { listBands } from '@/lib/db-bands'
import ClientHome from './ClientHome'

type Search = { q?: string; region?: string }

export default async function Page({ searchParams }: { searchParams: Search }) {
  const q = (searchParams.q ?? '').toString()
  const region = (searchParams.region ?? 'All Regions').toString()

  // Server-side filter (still safe to pass all and filter client-side if you prefer)
  const bands = await listBands({ q, region })

  return (
    <ClientHome
      initialBands={bands}
      initialQuery={q}
      initialRegion={region}
    />
  )
}
