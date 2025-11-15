'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function onPassword(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending'); setMsg('')
    try {
      const sb = supabaseBrowser()
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) throw error
      setStatus('sent'); setMsg('Signed in! You can close this tab.')
      location.assign('/')
    } catch (err: any) {
      setStatus('error'); setMsg(err?.message ?? 'Sign in failed')
    }
  }

  async function onEmail(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending'); setMsg('')
    try {
      const sb = supabaseBrowser()
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback?next=/` } })
      if (error) throw error
      setStatus('sent'); setMsg('Check your email for the magic link.')
    } catch (err: any) {
      setStatus('error'); setMsg(err?.message ?? 'Failed to send magic link')
    }
  }

  async function onOAuth(provider: 'github' | 'google') {
    const sb = supabaseBrowser()
    await sb.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/auth/callback?next=/` } })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
      <form onSubmit={onPassword} className="card mb-6 grid gap-3 p-6 animate-rise">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input w-full"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input w-full"
        />
        <button disabled={status==='sending'} className="rounded-xl btn-primary px-4 py-2 disabled:opacity-60 shadow-sm">
          {status==='sending' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="my-6 h-px bg-gray-200" />

      <form onSubmit={onEmail} className="card grid gap-3 p-6 animate-rise" style={{animationDelay:'80ms'} as any}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input w-full"
        />
        <button disabled={status==='sending'} className="rounded-xl btn-primary px-4 py-2 disabled:opacity-60 shadow-sm">
          {status==='sending' ? 'Sending…' : 'Send magic link'}
        </button>
      </form>

      <div className="my-6 h-px bg-gray-200" />

      <div className="flex gap-3">
        <button onClick={() => onOAuth('github')} className="chip-primary rounded-full px-3 py-1.5">Continue with GitHub</button>
        <button onClick={() => onOAuth('google')} className="chip-primary rounded-full px-3 py-1.5">Google</button>
      </div>

      {status==='sent' && <p className="mt-4 text-green-700">{msg}</p>}
      {status==='error' && <p className="mt-4 text-red-600">{msg}</p>}
    </div>
  )
}
