import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import ProfileForm from '@/components/ProfileForm'

export const metadata = { title: 'Edit Profile • Michigan Bands' }

export default async function ProfilePage() {
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
        <h1 className="mb-2 text-2xl font-bold">Edit Profile</h1>
        <p className="text-gray-700">
          Please <Link className="underline" href="/sign-in">sign in</Link> to manage your profile.
        </p>
      </div>
    )
  }

  const { data } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle()

  const initialName = (data?.name as string | null) ?? ''

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Edit Profile</h1>
      <ProfileForm initialName={initialName} />
    </div>
  )
}
