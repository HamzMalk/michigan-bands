import Link from 'next/link'

import type { Band } from '@/lib/bands' // or your local type

export default function BandCard({ band, style }: { band: Band; style?: React.CSSProperties }) {
  const hasMeta = Boolean(band.city || band.region || (band.genres ?? []).length)
  return (
    <div className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md animate-rise" style={style}>
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">
          <Link
            href={`/bands/${encodeURIComponent(String(band.slug ?? band.id))}`}
            prefetch={false}
            className="hover:underline"
          >
            {band.name}
          </Link>
        </h3>
      </div>

      {hasMeta && (
        <div className="mt-1 text-sm text-gray-600">
          {(band.city || band.region) && (
            <p>
              {band.city && <span className="font-medium text-gray-700">{band.city}</span>}
              {band.city && band.region && <span> • </span>}
              {band.region}
            </p>
          )}
          {(band.genres ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {(band.genres ?? []).slice(0, 3).map((g) => (
                <span key={g} className="chip-secondary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}






