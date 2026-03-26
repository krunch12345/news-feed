const moscowDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const preparePostView = (post) => {
  const result = { ...post }
  const date = Number(result.date)
  result.date_human = Number.isFinite(date) ? moscowDateFormatter.format(new Date(date * 1000)).replace(',', '') : ''

  const attachments = Array.isArray(result.attachments) ? result.attachments : []
  let photosCount = 0
  const audioTitles = []
  const videoTitles = []

  attachments.forEach((att) => {
    if (typeof att === 'string') {
      if (att === 'photo') {
        photosCount += 1
      }
      return
    }

    if (!att || typeof att !== 'object') {
      return
    }

    if (att.type === 'photo') {
      photosCount += 1
    } else if (att.type === 'audio' && att.title) {
      audioTitles.push(att.title)
    } else if (att.type === 'video' && att.title) {
      videoTitles.push(att.title)
    }
  })

  const parts = []
  if (photosCount) {
    parts.push(`Изображения (${photosCount})`)
  }
  if (audioTitles.length) {
    parts.push(`Аудио: ${audioTitles.join(', ')}`)
  }
  if (videoTitles.length) {
    parts.push(`Видео: ${videoTitles.join(', ')}`)
  }
  result.attachments_view = parts.join('; ')
  return result
}

export const buildPagination = (page, totalPages) => {
  const items = []
  if (totalPages <= 1) {
    return items
  }

  items.push({ type: 'first', page: 1, disabled: page <= 1 })
  items.push({ type: 'prev', page: Math.max(1, page - 1), disabled: page <= 1 })

  const windowSize = 2
  const start = Math.max(1, page - windowSize)
  const end = Math.min(totalPages, page + windowSize)

  if (start > 1) {
    items.push({ type: 'number', page: 1, active: page === 1 })
    if (start > 2) {
      items.push({ type: 'dots' })
    }
  }

  for (let p = start; p <= end; p += 1) {
    items.push({ type: 'number', page: p, active: p === page })
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      items.push({ type: 'dots' })
    }
    items.push({ type: 'number', page: totalPages, active: page === totalPages })
  }

  items.push({ type: 'next', page: Math.min(totalPages, page + 1), disabled: page >= totalPages })
  items.push({ type: 'last', page: totalPages, disabled: page >= totalPages })
  return items
}
