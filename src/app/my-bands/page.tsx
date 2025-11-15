import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import BandEditor from '@/components/BandEditor'
import type { BandRow } from '@/lib/db-bands'

export const metadata = { title: 'My Bands • Michigan Bands' }

export default async function MyBandsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {},
        remove() {},
      },
    }
  )

  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold">My Bands</h1>
        <p className="text-gray-700">
          Please <Link className="underline" href="/sign-in">sign in</Link> to view and edit your bands.
        </p>
      </div>
    )
  }

  const { data, error } = await supabase
    .from('bands')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  const bands = (data ?? []) as BandRow[]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">My Bands</h1>
      {error && <p className="text-red-600">{error.message}</p>}
      {bands.length === 0 ? (
        <p className="text-gray-700">No bands yet. <Link className="underline" href="/submit">Submit one</Link>.</p>
      ) : (
        <div className="space-y-6">
          {bands.map((b) => (
            <BandEditor key={b.id} band={b} />
          ))}
        </div>
      )}
    </div>
  )
}
