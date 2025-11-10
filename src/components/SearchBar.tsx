export default function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by name, city, genre…"
      className="w-full rounded-xl border px-3 py-2"
    />
  )
}
