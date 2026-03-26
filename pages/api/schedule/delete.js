import { loadSchedule, saveSchedule } from '@/lib/storage'
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

  const time = String(req.body?.time || '').trim()
  const times = await loadSchedule()
  const filtered = times.filter((entry) => entry !== time)
  if (filtered.length !== times.length) {
    await saveSchedule(filtered)
  }
  res.redirect(303, '/?tab=schedule')
}

export default handler
