import { notFound } from 'next/navigation'
import { getBandById } from '@/lib/db-bands'

export default async function BandPage({ params }: { params: { id: string } }) {
  const band = await getBandById(params.id)
  if (!band) return notFound()

  const links = (band.links ?? {}) as Record<string, string>
  const genres = band.genres ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">{band.name}</h1>
      <p className="mt-1 text-gray-600">
        {band.city ?? '—'} · {band.region ?? '—'}
      </p>

      {genres.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {genres.map((g) => (
            <span key={g} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {g}
            </span>
          ))}
        </div>
      )}

      {band.photo_url && (
        <img
          src={band.photo_url}
          alt={band.name}
          className="mt-6 w-full rounded-xl border object-cover"
        />
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {links.website && (
          <a className="rounded-lg border px-3 py-2 text-center hover:bg-gray-50" href={links.website} target="_blank">
            Website
          </a>
        )}
        {links.instagram && (
          <a className="rounded-lg border px-3 py-2 text-center hover:bg-gray-50" href={links.instagram} target="_blank">
            Instagram
          </a>
        )}
        {links.spotify && (
          <a className="rounded-lg border px-3 py-2 text-center hover:bg-gray-50" href={links.spotify} target="_blank">
            Spotify
          </a>
        )}
      </div>
    </div>
  )
}
