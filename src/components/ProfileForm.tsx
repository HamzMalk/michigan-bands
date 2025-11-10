'use client'

import { useState } from 'react'

export default function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState<'idle'|'saving'|'ok'|'error'>('idle')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving'); setMsg('')
    try {
      const res = await fetch('/api/profile/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Failed to save profile')
      setStatus('ok'); setMsg('Profile saved!')
    } catch (e: any) {
      setStatus('error'); setMsg(e?.message ?? 'Error saving profile')
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-lg gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Display name</label>
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <button disabled={status==='saving'} className="w-fit rounded-xl btn-primary px-4 py-2 disabled:opacity-60">
        {status==='saving' ? 'Saving…' : 'Save'}
      </button>
      {status==='ok' && <p className="text-green-700">{msg}</p>}
      {status==='error' && <p className="text-red-600">{msg}</p>}
    </form>
  )
}
