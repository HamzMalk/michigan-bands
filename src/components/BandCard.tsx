import type { Band } from '@/lib/bands'

export default function BandCard({ band }: { band: Band }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">{band.name}</h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{band.city}</span>
      </div>

      <p className="mt-1 text-sm text-gray-600">{band.region}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {band.genres.map((g) => (
          <span key={g} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
            {g}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-3 text-sm">
        {band.links?.website && (
          <a className="text-blue-600 hover:underline" href={band.links.website} target="_blank">
            Website
          </a>
        )}
        {band.links?.instagram && (
          <a className="text-blue-600 hover:underline" href={band.links.instagram} target="_blank">
            Instagram
          </a>
        )}
        {band.links?.spotify && (
          <a className="text-blue-600 hover:underline" href={band.links.spotify} target="_blank">
            Spotify
          </a>
        )}
      </div>
    </div>
  )
}
