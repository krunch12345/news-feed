import { SchedulePage } from '@/pages/SchedulePage/components/SchedulePage'
import { isFrontendAuthenticatedFromRequest } from '@/lib/auth'
import { loadSchedule } from '@/lib/storage'

/**
 * Renders schedule dashboard page.
 * @param {object} props
 * @returns {JSX.Element}
 */
const ScheduleRoutePage = (props) => <SchedulePage {...props} />

/**
 * Loads schedule data for dashboard page.
 * @param {object} context
 * @returns {Promise<{redirect: {destination: string, permanent: boolean}} | {props: object}>}
 */
export const getServerSideProps = async ({ req }) => {
  if (!isFrontendAuthenticatedFromRequest(req)) {
    return {
      redirect: { destination: '/login', permanent: false },
    }
  }

  const scheduleTimes = (await loadSchedule()).sort()

  return {
    props: {
      scheduleTimes,
      totalSchedule: scheduleTimes.length,
    },
  }
}

export default ScheduleRoutePage
