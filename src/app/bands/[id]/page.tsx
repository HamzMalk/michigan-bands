import { getBandById, getBandBySlug } from '@/lib/db-bands'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function BandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let band = await getBandBySlug(id)
  if (!band) {
    band = await getBandById(id)
  }
  if (!band) return notFound()

  const links = (band.links ?? {}) as Record<string, unknown>
  const website = typeof links['website'] === 'string' ? (links['website'] as string) : undefined
  const instagram = typeof links['instagram'] === 'string' ? (links['instagram'] as string) : undefined
  const spotify = typeof links['spotify'] === 'string' ? (links['spotify'] as string) : undefined

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-600 hover:underline">← Back to list</Link>
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{band.name}</h1>
      <div className="mb-6 text-gray-700">
        {(band.city || band.region) && (
          <p>
            {band.city ? <span className="font-medium">{band.city}</span> : null}
            {band.city && band.region ? <span> • </span> : null}
            {band.region ? <span>{band.region}</span> : null}
          </p>
        )}
        {(band.genres ?? []).length > 0 && (
          <p className="mt-1 text-sm">Genres: {(band.genres ?? []).join(', ')}</p>
        )}
      </div>
      <div className="space-x-3">
        {website && (
          <a className="rounded-lg border px-3 py-1.5 hover:bg-gray-50" href={website} target="_blank" rel="noreferrer">
            Website
          </a>
        )}
        {instagram && (
          <a className="rounded-lg border px-3 py-1.5 hover:bg-gray-50" href={instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        )}
        {spotify && (
          <a className="rounded-lg border px-3 py-1.5 hover:bg-gray-50" href={spotify} target="_blank" rel="noreferrer">
            Spotify
          </a>
        )}
      </div>
    </div>
  )
}
