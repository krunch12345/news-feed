import { PostsPage } from '@/pages/PostsPage/components/PostsPage'
import { isFrontendAuthenticatedFromRequest } from '@/lib/auth'
import { appConfig } from '@/lib/config'
import { loadPosts } from '@/lib/storage'
import { preparePostView } from '@/lib/view'

/**
 * Renders posts dashboard page.
 * @param {object} props
 * @returns {JSX.Element}
 */
const PostsRoutePage = (props) => <PostsPage {...props} />

/**
 * Loads posts data for dashboard page.
 * @param {object} context
 * @returns {Promise<{redirect: {destination: string, permanent: boolean}} | {props: object}>}
 */
export const getServerSideProps = async ({ req, query }) => {
  if (!isFrontendAuthenticatedFromRequest(req)) {
    return {
      redirect: { destination: '/login', permanent: false },
    }
  }

  let page = Number.parseInt(query?.page || '1', 10)
  if (!Number.isInteger(page) || page < 1) {
    page = 1
  }

  const allPosts = await loadPosts()
  const sortedPosts = [...allPosts].sort((a, b) => Number(a?.date || 0) - Number(b?.date || 0))
  const totalPosts = sortedPosts.length
  const totalPages = Math.max(1, Math.ceil(totalPosts / appConfig.pageSize))
  page = Math.min(page, totalPages)

  const start = (page - 1) * appConfig.pageSize
  const posts = sortedPosts.slice(start, start + appConfig.pageSize).map(preparePostView)

  return {
    props: {
      page,
      totalPages,
      totalPosts,
      posts,
    },
  }
}

export default PostsRoutePage
