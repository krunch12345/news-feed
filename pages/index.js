import { DashboardClient } from '@/components/dashboard-client'
import { appConfig } from '@/lib/config'
import { isFrontendAuthenticatedFromRequest } from '@/lib/auth'
import { loadGroups, loadPosts, loadSchedule } from '@/lib/storage'
import { preparePostView } from '@/lib/view'

const HomePage = (props) => <DashboardClient {...props} />

export const getServerSideProps = async ({ req, query }) => {
  if (!isFrontendAuthenticatedFromRequest(req)) {
    return {
      redirect: { destination: '/login', permanent: false },
    }
  }

  const activeTab = ['posts', 'schedule', 'groups'].includes(query?.tab) ? query.tab : 'posts'
  let page = Number.parseInt(query?.page || '1', 10)
  if (!Number.isInteger(page) || page < 1) {
    page = 1
  }

  let posts = []
  let scheduleTimes = []
  let groups = []
  let totalPosts = 0
  let totalSchedule = 0
  let totalGroups = 0
  let totalPages = 1

  if (activeTab === 'posts') {
    const allPosts = await loadPosts()
    const sorted = [...allPosts].sort((a, b) => Number(a?.date || 0) - Number(b?.date || 0))
    totalPosts = sorted.length
    totalPages = Math.max(1, Math.ceil(totalPosts / appConfig.pageSize))
    page = Math.min(page, totalPages)
    const start = (page - 1) * appConfig.pageSize
    posts = sorted.slice(start, start + appConfig.pageSize).map(preparePostView)
  } else if (activeTab === 'schedule') {
    scheduleTimes = (await loadSchedule()).sort()
    totalSchedule = scheduleTimes.length
  } else {
    const allGroups = await loadGroups()
    const q = String(query?.group_query || '').trim().toLowerCase()
    groups = q ? allGroups.filter((group) => group.name.toLowerCase().includes(q) || group.id.toLowerCase().includes(q)) : allGroups
    totalGroups = groups.length
  }

  return {
    props: {
      activeTab,
      page,
      totalPages,
      totalPosts,
      totalSchedule,
      totalGroups,
      posts,
      scheduleTimes,
      groups,
      groupQuery: String(query?.group_query || ''),
    },
  }
}

export default HomePage
