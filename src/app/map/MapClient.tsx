"use client"

import { useEffect, useMemo, useRef, useState } from 'react'

type MinimalBand = {
  id: string | number
  name: string
  city?: string
  region?: string
  slug?: string | null | undefined
}

const REGION_CENTERS: Record<string, [number, number]> = {
  'Detroit Metro': [42.3314, -83.0458],
  'Ann Arbor': [42.2808, -83.7430],
  'West MI': [42.9634, -85.6681], // Grand Rapids
  'Lansing/Jackson': [42.7325, -84.5555],
  'Flint/Saginaw': [43.0125, -83.6875],
  'Northern MI': [44.7631, -85.6206], // Traverse City
  'UP': [46.5436, -87.3956], // Marquette
}

function normalizeRegion(r?: string): keyof typeof REGION_CENTERS | undefined {
  if (!r) return undefined
  const k = Object.keys(REGION_CENTERS).find((x) => x.toLowerCase() === r.toLowerCase())
  return k as any
}

function bandUrl(b: MinimalBand) {
  const id = b.slug ?? b.id
  return `/bands/${encodeURIComponent(String(id))}`
}

export default function MapClient({ bands }: { bands: MinimalBand[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  // Prepare points; jitter slightly so markers in same region don’t overlap perfectly
  const points = useMemo(() => {
    const items: Array<{ band: MinimalBand; lat: number; lng: number }> = []
    for (const b of bands) {
      const rg = normalizeRegion(b.region)
      const center = rg ? REGION_CENTERS[rg] : REGION_CENTERS['Detroit Metro']
      const jitter = () => (Math.random() - 0.5) * 0.12 // ~0.12° jitter
      const lat = center[0] + jitter()
      const lng = center[1] + jitter()
      items.push({ band: b, lat, lng })
    }
    return items
  }, [bands])

  // Load Leaflet CSS/JS via CDN once
  useEffect(() => {
    let cancelled = false
    function ensureLeaflet(): Promise<typeof window & { L: any }> {
      if (typeof window !== 'undefined' && (window as any).L) return Promise.resolve(window as any)
      return new Promise((resolve, reject) => {
        const cssId = 'leaflet-css'
        if (!document.getElementById(cssId)) {
          const link = document.createElement('link')
          link.id = cssId
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }
        const jsId = 'leaflet-js'
        if (!document.getElementById(jsId)) {
          const script = document.createElement('script')
          script.id = jsId
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.async = true
          script.onload = () => resolve(window as any)
          script.onerror = (e) => reject(e)
          document.body.appendChild(script)
        } else {
          resolve(window as any)
        }
      })
    }
    ensureLeaflet()
      .then(() => { if (!cancelled) setReady(true) })
      .catch(() => { /* ignore load errors; user may be offline */ })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready || !mapRef.current) return
    const L = (window as any).L
    if (!L) return
    const map = L.map(mapRef.current).setView([44.2, -84.5], 6) // Michigan-ish center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const purple = '#8b5cf6'
    const markers: any[] = []
    for (const p of points) {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6,
        color: purple,
        weight: 2,
        opacity: 0.9,
        fillColor: '#a78bfa',
        fillOpacity: 0.7,
      }).addTo(map)
      marker.bindPopup(`<div style="min-width:180px"><strong>${escapeHtml(p.band.name)}</strong><br/>${escapeHtml(p.band.city ?? p.band.region ?? '')}<br/><a href="${bandUrl(p.band)}">View</a></div>`, { closeButton: true })
      markers.push(marker)
    }
    const group = L.featureGroup(markers)
    if (markers.length) {
      try { map.fitBounds(group.getBounds().pad(0.2)) } catch {}
    }
    return () => { map.remove() }
  }, [ready, points])

  return (
    <div>
      <div className="mb-3 text-sm text-gray-600">Showing {bands.length} band{bands.length === 1 ? '' : 's'} on map</div>
      <div ref={mapRef} style={{ height: 520, width: '100%', borderRadius: 16, overflow: 'hidden' }} />
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c] as string))
}

