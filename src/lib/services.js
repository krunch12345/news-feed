import fs from 'node:fs/promises'
import path from 'node:path'
import { appConfig } from './config.js'
import { fetchPostsForGroups } from './vk-client.js'
import { loadGroups, loadPosts, savePosts, loadSchedule } from './storage.js'

const maxImagesPerPost = 10

const resolvePostsImagesDir = () =>
  path.isAbsolute(appConfig.postsImagesDir)
    ? appConfig.postsImagesDir
    : path.resolve(appConfig.rootDir, appConfig.postsImagesDir)

const logImage = (message) => {
  process.stderr.write(`[news-feed images] ${message}\n`)
}

const downloadPostImages = async (post) => {
  const images = []
  const attachments = post?.attachments || []
  const postId = String(post?.id || '')
  const targetDir = resolvePostsImagesDir()

  for (let index = 0; index < attachments.length; index += 1) {
    if (images.length >= maxImagesPerPost) {
      break
    }

    const attachment = attachments[index]
    if (attachment?.type !== 'photo') {
      continue
    }
    if (!attachment?.url) {
      logImage(`post ${postId} attachment #${index}: type photo but no URL (VK payload missing sizes/orig_photo?)`)
      continue
    }

    const filename = `${postId.replaceAll('-', '_')}_${index}.jpg`
    const localPath = path.join(targetDir, filename)

    try {
      await fs.access(localPath)
      images.push(filename)
      continue
    } catch {
      // file missing, download below
    }

    try {
      const response = await fetch(attachment.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsFeed/1.0)',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      })
      if (!response.ok) {
        logImage(`post ${postId} fetch ${response.status} ${response.statusText} — ${attachment.url.slice(0, 120)}`)
        continue
      }
      const arrayBuffer = await response.arrayBuffer()
      await fs.mkdir(targetDir, { recursive: true })
      await fs.writeFile(localPath, Buffer.from(arrayBuffer))
      images.push(filename)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      logImage(`post ${postId} save failed (${localPath}): ${msg}`)
    }
  }

  return images
}

export const updatePostsStorage = async () => {
  const groups = await loadGroups()
  if (!groups.length) {
    return 0
  }

  const existingPosts = await loadPosts()
  const existingIds = new Set(existingPosts.map((post) => String(post?.id)))
  const fetchedPosts = await fetchPostsForGroups(groups)
  const threshold = Math.floor(Date.now() / 1000) - (4 * 3600)
  const recentFetched = fetchedPosts.filter((post) => Number(post?.date) >= threshold)

  const newPosts = []
  let loggedImagesDir = false
  for (const post of recentFetched) {
    if (existingIds.has(String(post.id))) {
      continue
    }
    if (!loggedImagesDir) {
      process.stderr.write(`[news-feed] saving images under: ${resolvePostsImagesDir()} (cwd=${appConfig.rootDir})\n`)
      loggedImagesDir = true
    }
    const postImages = await downloadPostImages(post)
    if (postImages.length) {
      post.postImages = postImages
    }
    newPosts.push(post)
  }

  if (!newPosts.length) {
    if (recentFetched.length > 0) {
      process.stderr.write(
        '[news-feed] no new posts to save (all fetched wall items already in posts.json); images are only downloaded for newly added posts\n',
      )
    }
    return 0
  }

  const combined = [...newPosts, ...existingPosts].slice(0, appConfig.maxPosts)
  await savePosts(combined)
  return newPosts.length
}

export const runScheduledUpdate = async () => {
  const times = await loadSchedule()
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const nowTime = `${hh}:${mm}`
  if (!times.includes(nowTime)) {
    return 0
  }
  return updatePostsStorage()
}
