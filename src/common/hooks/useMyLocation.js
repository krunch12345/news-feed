import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { ALL_PAGES } from '@/common/constants/allPages'

/**
 * Returns route flags for dashboard sections based on the current pathname.
 *
 * @returns {{
 *   pathname: string,
 *   isPosts: boolean,
 *   isSchedule: boolean,
 *   isGroups: boolean,
 *   isNotFound: boolean
 * }} Current location state for dashboard navigation.
 */
export const useMyLocation = () => {
  const router = useRouter()
  const pathname = router.pathname || '/'

  return useMemo(() => {
    const isPosts = pathname === '/posts'
    const isSchedule = pathname === '/schedule'
    const isGroups = pathname === '/groups'

    return {
      pathname,
      isPosts,
      isSchedule,
      isGroups,
      isNotFound: !ALL_PAGES.includes(pathname),
    }
  }, [pathname])
}
