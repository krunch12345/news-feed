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
    res.status(400).json({ status: 'error', message: 'Тайминг не может быть пустым' })
    return
  }

  try {
    const times = await loadSchedule()
    if (times.includes(time)) {
      res.status(400).json({ status: 'error', message: 'Такой тайминг уже существует' })
      return
    }

    times.push(time)
    times.sort()
    await saveSchedule(times)
    res.status(200).json({ status: 'ok' })
  } catch {
    res.status(500).json({ status: 'error', message: 'Не удалось сохранить тайминг' })
  }
}

export default handler
