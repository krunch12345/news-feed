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
  if (!time) {
    res.redirect(303, '/schedule')
    return
  }

  const times = await loadSchedule()
  if (!times.includes(time)) {
    times.push(time)
    times.sort()
    await saveSchedule(times)
  }
  res.redirect(303, '/schedule')
}

export default handler
