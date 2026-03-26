import { loadGroups, saveGroups } from '@/lib/storage'
import { isRequestAuthorizedFromNodeRequest } from '@/lib/auth'

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  if (!isRequestAuthorizedFromNodeRequest(req)) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' })
    return
  }

  const groupId = String(req.body?.group_id || '')
  const allGroups = await loadGroups()
  const filtered = allGroups.filter((group) => String(group.id) !== groupId)
  if (filtered.length !== allGroups.length) {
    await saveGroups(filtered)
  }
  res.redirect(303, '/?tab=groups')
}

export default handler
