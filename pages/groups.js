import { GroupsPage } from '@/pages/GroupsPage/components/GroupsPage'
import { isFrontendAuthenticatedFromRequest } from '@/lib/auth'
import { loadGroups } from '@/lib/storage'

/**
 * Renders groups dashboard page.
 * @param {object} props
 * @returns {JSX.Element}
 */
const GroupsRoutePage = (props) => <GroupsPage {...props} />

/**
 * Loads groups data for dashboard page.
 * @param {object} context
 * @returns {Promise<{redirect: {destination: string, permanent: boolean}} | {props: object}>}
 */
export const getServerSideProps = async ({ req, query }) => {
  if (!isFrontendAuthenticatedFromRequest(req)) {
    return {
      redirect: { destination: '/login', permanent: false },
    }
  }

  const allGroups = await loadGroups()
  const groupQuery = String(query?.group_query || '')
  const normalizedGroupQuery = groupQuery.trim().toLowerCase()

  const groups = normalizedGroupQuery
    ? allGroups.filter(
      (group) =>
        group.name.toLowerCase().includes(normalizedGroupQuery) ||
          group.id.toLowerCase().includes(normalizedGroupQuery),
    )
    : allGroups

  return {
    props: {
      groups,
      groupQuery,
      totalGroups: groups.length,
    },
  }
}

export default GroupsRoutePage
