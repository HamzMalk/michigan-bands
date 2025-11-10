'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving'); setMsg('')
    try {
      const sb = supabaseBrowser()
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?next=/my-bands`,
          data: { name },
        },
      })
      if (error) throw error

      // If email confirmations are off, we have a session and can upsert profile immediately
      if (data.session) {
        const res = await fetch('/api/profile/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        // ignore response; UI will redirect on server refresh
      }
      setStatus('ok');
      setMsg('Account created. Check your email to confirm (if required), then you will be signed in.')
    } catch (e: any) {
      setStatus('error'); setMsg(e?.message ?? 'Sign up failed')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Create your account</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border px-3 py-2"
        />
        <button disabled={status==='saving'} className="rounded-xl btn-primary px-4 py-2 disabled:opacity-60">
          {status==='saving' ? 'Creating…' : 'Create account'}
        </button>
      </form>
      {status==='ok' && <p className="mt-4 text-green-700">{msg}</p>}
      {status==='error' && <p className="mt-4 text-red-600">{msg}</p>}
    </div>
  )
}
