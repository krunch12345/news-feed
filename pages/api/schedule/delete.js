import { loadSchedule, saveSchedule } from '@/lib/storage'
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

  const time = String(req.body?.time || '').trim()
  if (!time) {
    res.status(400).json({ status: 'error', message: 'Не передан тайминг для удаления' })
    return
  }

  try {
    const times = await loadSchedule()
    const filtered = times.filter((entry) => entry !== time)
    if (filtered.length === times.length) {
      res.status(404).json({ status: 'error', message: 'Тайминг не найден' })
      return
    }

    await saveSchedule(filtered)
    res.status(200).json({ status: 'ok' })
  } catch {
    res.status(500).json({ status: 'error', message: 'Не удалось удалить тайминг' })
  }
}

export default handler
