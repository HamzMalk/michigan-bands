import Link from 'next/link'
import type { Band } from '@/lib/bands' // or keep your local type

export default function BandCard({ band }: { band: Band }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">
          <Link href={`/bands/${band.slug ?? band.id}`} className="hover:underline">
          {band.name}
          </Link>
        </h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{band.city}</span>
      </div>
      {/* ...rest unchanged */}
    </div>
  )
}

