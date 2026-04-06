import { isRequestAuthorizedFromNodeRequest } from '@/lib/auth'
import { getPostsSlicePayload } from '@/lib/postsPageData'

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ status: 'error', message: 'Method not allowed' })
    return
  }
  if (!isRequestAuthorizedFromNodeRequest(req)) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' })
    return
  }

  const offset = req.query?.offset ?? '0'
  const limit = req.query?.limit ?? '1'

  try {
    const { posts, totalPosts } = await getPostsSlicePayload(offset, limit)
    res.status(200).json({ status: 'ok', posts, totalPosts })
  } catch {
    res.status(500).json({ status: 'error', message: 'Не удалось загрузить посты' })
  }
}

export default handler
