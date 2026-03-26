import fs from 'node:fs/promises'
import path from 'node:path'
import { appConfig } from './config.js'

const postsFile = path.join(appConfig.dataDir, 'posts.json')
const groupsFile = path.join(appConfig.dataDir, 'groups.json')
const scheduleFile = path.join(appConfig.dataDir, 'schedule.json')

const safeLoadJson = async (filePath, fallback) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

const safeSaveJson = async (filePath, data) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  const tmpPath = `${filePath}.tmp`
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tmpPath, filePath)
}

export const loadPosts = async () => {
  const data = await safeLoadJson(postsFile, [])
  return Array.isArray(data) ? data : []
}

export const savePosts = async (posts) => safeSaveJson(postsFile, posts)

export const loadGroups = async () => {
  const data = await safeLoadJson(groupsFile, [])
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .map((item) => {
      if (item && typeof item === 'object') {
        const id = String(item.id || '').trim()
        const name = String(item.name || '').trim() || id
        return id ? { id, name } : null
      }
      const id = String(item || '').trim()
      return id ? { id, name: id } : null
    })
    .filter(Boolean)
}

export const saveGroups = async (groups) => {
  const normalized = groups
    .map((item) => {
      if (item && typeof item === 'object') {
        const id = String(item.id || '').trim()
        const name = String(item.name || '').trim() || id
        return id ? { id, name } : null
      }
      const id = String(item || '').trim()
      return id ? { id, name: id } : null
    })
    .filter(Boolean)

  await safeSaveJson(groupsFile, normalized)
}

export const loadSchedule = async () => {
  const data = await safeLoadJson(scheduleFile, [])
  return Array.isArray(data) ? data.map((v) => String(v)) : []
}

export const saveSchedule = async (times) => safeSaveJson(scheduleFile, times)

export const deletePostById = async (postId) => {
  const posts = await loadPosts()
  const keep = []
  const imageNames = []

  for (const post of posts) {
    if (String(post?.id) === String(postId)) {
      for (const imageName of post?.postImages || []) {
        if (imageName) {
          imageNames.push(String(imageName))
        }
      }
      continue
    }
    keep.push(post)
  }

  if (keep.length === posts.length) {
    return false
  }

  await Promise.all(
    imageNames.map(async (name) => {
      const filePath = path.join(appConfig.postsImagesDir, name)
      await fs.unlink(filePath).catch(() => null)
    }),
  )

  await savePosts(keep)
  return true
}
