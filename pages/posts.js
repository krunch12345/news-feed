import PropTypes from 'prop-types'
import { PostsPage } from '@/pages/PostsPage/components/PostsPage'
import { isFrontendAuthenticatedFromRequest } from '@/lib/auth'
import { getPostsPagePayload } from '@/lib/postsPageData'

/**
 * Renders posts dashboard page.
 * @param {object} props
 * @returns {JSX.Element}
 */
const PostsRoutePage = (props) => <PostsPage key={`${props.page}-${props.totalPosts}`} {...props} />

PostsRoutePage.propTypes = {
  ...PostsPage.propTypes,
}

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
  const payload = await getPostsPagePayload(page)

  return {
    props: payload,
  }
}

export default PostsRoutePage
