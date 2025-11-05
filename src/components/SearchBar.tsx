'use client'

import { useEffect, useRef } from 'react'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search bands, genres, cities…',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    // focus the search box on load
    ref.current?.focus()
  }, [])
  return (
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border bg-white/90 px-4 py-2 outline-none ring-0 focus:border-blue-400"
      />
      <div className="pointer-events-none absolute right-3 top-2.5 text-gray-400">⌘K</div>
    </div>
  )
}
