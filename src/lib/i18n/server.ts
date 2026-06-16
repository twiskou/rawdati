import { cookies } from 'next/headers'
import fr from './messages/fr'
import ar from './messages/ar'

export async function getServerLanguage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('allo-mama-locale')?.value === 'ar' ? 'ar' : 'fr'
  
  return {
    locale,
    t: locale === 'ar' ? ar : fr,
    isRTL: locale === 'ar'
  }
}
