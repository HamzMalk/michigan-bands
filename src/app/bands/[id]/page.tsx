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
  const youtube = typeof links['youtube'] === 'string' ? (links['youtube'] as string) : undefined

  const normUrl = (u: string | undefined) => {
    if (!u) return undefined
    try {
      const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u)
      return new URL(hasScheme ? u : `https://${u}`).toString()
    } catch {
      return undefined
    }
  }

  const prettyHost = (u: string | undefined) => {
    if (!u) return undefined
    try {
      const url = new URL(u)
      return url.host.replace(/^www\./, '')
    } catch {
      return undefined
    }
  }

  const instaHandle = (u: string | undefined) => {
    if (!u) return undefined
    try {
      const url = new URL(normUrl(u)!)
      const seg = url.pathname.split('/').filter(Boolean)[0]
      return seg ? `@${seg}` : 'Instagram'
    } catch {
      return 'Instagram'
    }
  }

  const toSpotifyEmbed = (u: string | undefined) => {
    if (!u) return undefined
    try {
      const url = new URL(normUrl(u)!)
      if (url.host !== 'open.spotify.com') return undefined
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts.length < 2) return undefined
      const type = parts[0]
      const id = parts[1]
      const allowed = new Set(['artist', 'album', 'track', 'playlist', 'episode', 'show'])
      if (!allowed.has(type) || !id) return undefined
      const embed = new URL(`https://open.spotify.com/embed/${type}/${id}`)
      return embed.toString()
    } catch {
      return undefined
    }
  }

  const toYouTubeEmbed = (u: string | undefined) => {
    if (!u) return undefined
    try {
      const url = new URL(normUrl(u)!)
      const host = url.host.replace(/^www\./, '')
      // Already an embed URL
      if (host === 'youtube.com' && url.pathname.startsWith('/embed/')) return url.toString()

      // youtu.be/<id>
      if (host === 'youtu.be') {
        const id = url.pathname.split('/').filter(Boolean)[0]
        if (id) return `https://www.youtube.com/embed/${id}`
      }

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        const parts = url.pathname.split('/').filter(Boolean)
        // shorts/<id>
        if (parts[0] === 'shorts' && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`
        // watch?v=<id>
        const v = url.searchParams.get('v')
        if (parts[0] === 'watch' && v) return `https://www.youtube.com/embed/${v}`
        // playlist?list=<id>
        const list = url.searchParams.get('list')
        if (parts[0] === 'playlist' && list) return `https://www.youtube.com/embed/videoseries?list=${list}`
      }
      return undefined
    } catch {
      return undefined
    }
  }

  const websiteUrl = normUrl(website)
  const instagramUrl = normUrl(instagram)
  const spotifyEmbed = toSpotifyEmbed(spotify)
  const youtubeEmbed = toYouTubeEmbed(youtube)

  const Svg = {
    globe: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm6-8a6 6 0 01-5-2.69V5a6.01 6.01 0 015 5zM9 5.03v2.28A6 6 0 004 10c0 1.1.3 2.13.83 3.01l2.1-.7a2 2 0 011.27-.01l1.96.65a2 2 0 001.27-.01l1.86-.62A6 6 0 0010 4a6.04 6.04 0 00-1 .08z" />
      </svg>
    ),
    instagram: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3zm11 1a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
      </svg>
    ),
    spotify: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.48 14.28a.75.75 0 01-1.03.25c-2.82-1.73-6.37-2.12-10.55-1.16a.75.75 0 11-.33-1.46c4.55-1.03 8.45-.58 11.53 1.31.35.22.46.68.25 1.06zm1.41-3.2a.9.9 0 01-1.25.3c-3.22-1.98-8.14-2.55-11.95-1.4a.9.9 0 11-.52-1.73c4.36-1.3 9.76-.67 13.37 1.53.42.26.55.82.35 1.31zM18 8.4c-3.63-2.16-9.6-2.36-13.1-1.29a1.05 1.05 0 11-.6-2.02C8.2 4.91 14.82 5.15 19 7.64c.56.33.7 1.03.4 1.54-.3.5-.99.67-1.4.36z" />
      </svg>
    ),
    youtube: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.7 3.5 12 3.5 12 3.5s-7.7 0-9.4.6A3 3 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3 3 0 002.1 2.1c1.7.6 9.4.6 9.4.6s7.7 0 9.4-.6a3 3 0 002.1-2.1A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  }

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
      {(websiteUrl || instagramUrl || spotifyEmbed || youtubeEmbed) && (
        <section className="mt-6 space-y-4">
          {youtubeEmbed && (
            <div className="overflow-hidden rounded-xl border">
              <iframe
                title="YouTube"
                src={youtubeEmbed}
                width="100%"
                height="315"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
          {spotifyEmbed && (
            <div className="overflow-hidden rounded-xl border">
              <iframe
                title="Spotify"
                src={spotifyEmbed}
                width="100%"
                height="152"
                frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {websiteUrl && (
              <a className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 hover:bg-gray-50" href={websiteUrl} target="_blank" rel="noreferrer">
                {Svg.globe}
                <span>{prettyHost(websiteUrl) ?? 'Website'}</span>
              </a>
            )}
            {instagramUrl && (
              <a className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 hover:bg-gray-50" href={instagramUrl} target="_blank" rel="noreferrer">
                {Svg.instagram}
                <span>{instaHandle(instagramUrl)}</span>
              </a>
            )}
            {spotify && (
              <a className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 hover:bg-gray-50" href={normUrl(spotify)} target="_blank" rel="noreferrer">
                {Svg.spotify}
                <span>Spotify</span>
              </a>
            )}
            {youtube && (
              <a className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 hover:bg-gray-50" href={normUrl(youtube)} target="_blank" rel="noreferrer">
                {Svg.youtube}
                <span>YouTube</span>
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
