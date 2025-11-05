// SERVER ENTRY
import { listBands } from '@/lib/db-bands'
import ClientHome from './ClientHome'

export const dynamic = 'force-dynamic' // fresh data during dev

export default async function Page() {
  const bands = await listBands()
  return <ClientHome initialBands={bands} />
}
