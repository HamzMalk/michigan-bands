export type Band = {
  id: string | number
  name: string
  city: string
  region:
    | 'Detroit Metro'
    | 'Ann Arbor'
    | 'West MI'
    | 'Lansing/Jackson'
    | 'Flint/Saginaw'
    | 'Northern MI'
    | 'UP'
  genres: string[]
  links?: { website?: string; instagram?: string; spotify?: string }
  slug?: string | null
  photo_url?: string | null
}

export const BANDS: Band[] = [
  // ...your mock rows here...
]
