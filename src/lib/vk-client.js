import { appConfig } from './config.js'

const vkLinkPattern = /\[(.+?)\|(.+?)\]/g

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const cleanVkLinks = (text) => (text ? text.replace(vkLinkPattern, '$2') : '')

const callVkMethod = async (method, params) => {
  const url = new URL(`https://api.vk.com/method/${method}`)
  const merged = {
    access_token: appConfig.vkToken,
    v: appConfig.vkApiVersion,
    ...params,
  }
  Object.entries(merged).forEach(([key, value]) => url.searchParams.set(key, String(value)))

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(url, { cache: 'no-store' })
    const data = await response.json()
    if (!data.error) {
      return data
    }
    if (data.error.error_code === 6 && attempt === 0) {
      await sleep(2000)
      continue
    }
    throw new Error(`VK API error ${data.error.error_code}: ${data.error.error_msg}`)
  }
  throw new Error('VK API failed after retries')
}

const pickPhotoUrl = (photo) => {
  if (!photo || typeof photo !== 'object') {
    return ''
  }
  if (photo.orig_photo?.url) {
    return photo.orig_photo.url
  }
  const legacyKeys = ['photo_2560', 'photo_1280', 'photo_807', 'photo_604', 'photo_130', 'photo_75']
  for (const key of legacyKeys) {
    const candidate = photo[key]
    if (typeof candidate === 'string' && candidate.startsWith('http')) {
      return candidate
    }
  }
  const sizes = Array.isArray(photo.sizes) ? photo.sizes : []
  const best = sizes.reduce(
    (acc, item) => {
      const score = (item?.width || 0) * (item?.height || 0)
      return score > acc.score ? { score, url: item?.url || '' } : acc
    },
    { score: 0, url: '' },
  )
  return best.url || ''
}

const mapAttachments = (rawAttachments = []) => {
  return rawAttachments.map((att) => {
    const type = att?.type
    if (type === 'photo') {
      const url = pickPhotoUrl(att?.photo)
      return url ? { type: 'photo', url } : { type: 'photo' }
    }
    if (type === 'posted_photo') {
      const url = pickPhotoUrl(att?.posted_photo)
      return url ? { type: 'photo', url } : { type: 'photo' }
    }
    if (type === 'audio') {
      const artist = att?.audio?.artist || ''
      const title = att?.audio?.title || ''
      const full = `${artist} - ${title}`.trim().replace(/^- | -$/g, '')
      return full ? { type: 'audio', title: full } : { type: 'audio' }
    }
    if (type === 'video') {
      const title = att?.video?.title || ''
      return title ? { type: 'video', title } : { type: 'video' }
    }
    return { type }
  })
}

export const fetchPostsForGroups = async (groups, count = 5) => {
  const allPosts = []

  for (const group of groups) {
    const groupId = String(group?.id || group || '').trim()
    const groupNameFromConfig = String(group?.name || '').trim()
    if (!groupId) {
      continue
    }

    const ownerId = Number.parseInt(groupId, 10)
    if (!Number.isInteger(ownerId)) {
      continue
    }

    try {
      const data = await callVkMethod('wall.get', { owner_id: ownerId, count, extended: 1 })
      const response = data.response || {}
      const items = response.items || []
      const apiGroup = (response.groups || []).find((item) => Number(item.id) * -1 === ownerId)
      const groupName = groupNameFromConfig || apiGroup?.name || groupId

      items.forEach((item) => {
        if (item.copy_history) {
          return
        }
        const postId = `${item.owner_id}_${item.id}`
        allPosts.push({
          id: postId,
          group: groupName,
          date: item.date,
          text: cleanVkLinks(item.text || ''),
          url: `https://vk.com/wall${postId}`,
          attachments: mapAttachments(item.attachments || []),
        })
      })
    } catch {
      await sleep(appConfig.vkRequestDelayMs)
      continue
    }

    await sleep(appConfig.vkRequestDelayMs)
  }

  return allPosts
}
