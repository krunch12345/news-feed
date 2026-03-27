import { loadGroups, saveGroups } from '@/lib/storage'
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

  const groupId = String(req.body?.group_id || '')
  if (!groupId) {
    res.status(400).json({ status: 'error', message: 'Не передан ID сообщества для удаления' })
    return
  }

  try {
    const allGroups = await loadGroups()
    const filtered = allGroups.filter((group) => String(group.id) !== groupId)
    if (filtered.length === allGroups.length) {
      res.status(404).json({ status: 'error', message: 'Сообщество не найдено' })
      return
    }

    await saveGroups(filtered)
    res.status(200).json({ status: 'ok' })
  } catch {
    res.status(500).json({ status: 'error', message: 'Не удалось удалить сообщество' })
  }
}

export default handler
