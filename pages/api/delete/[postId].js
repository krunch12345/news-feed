import { deletePostById } from '@/lib/storage'
import { isRequestAuthorizedFromNodeRequest } from '@/lib/auth'

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ status: 'error', message: 'Method not allowed' })
    return
  }
  if (!isRequestAuthorizedFromNodeRequest(req)) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' })
    return
  }

  const postId = String(req.query.postId || '').trim()
  if (!postId) {
    res.status(400).json({ status: 'error', message: 'Не передан ID поста для удаления' })
    return
  }

  try {
    const result = await deletePostById(postId)
    if (!result.deleted) {
      res.status(404).json({ status: 'error', message: 'Пост не найден' })
      return
    }
    res.status(200).json({ status: 'ok', totalPosts: result.totalPosts })
  } catch {
    res.status(500).json({ status: 'error', message: 'Не удалось удалить пост' })
  }
}

export default handler
