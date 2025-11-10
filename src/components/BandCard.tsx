import Link from 'next/link'

import type { Band } from '@/lib/bands' // or your local type

export default function BandCard({ band }: { band: Band }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">
        <Link
          href={`/bands/${encodeURIComponent(String(band.slug ?? band.id))}`}
          prefetch={false} // avoids prefetch masking issues while we debug
          className="hover:underline"
          >
        {band.name}
        </Link>

        </h3>
        {/* ... */}
      </div>
      {/* ...rest of card */}
    </div>
  )
}






