import { cookies } from 'next/headers'
import fr from './messages/fr'
import ar from './messages/ar'

export async function getT() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('allo-mama-locale')?.value
  return locale === 'ar' ? ar : fr
}
