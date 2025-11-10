'use client'

import { supabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <button
      className={className ?? 'rounded-lg border px-3 py-1.5 hover:bg-gray-50'}
      onClick={async () => {
        const sb = supabaseBrowser()
        await sb.auth.signOut()
        router.refresh()
      }}
    >
      Sign out
    </button>
  )
}

