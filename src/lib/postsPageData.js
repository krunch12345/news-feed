import { appConfig } from '@/lib/config'
import { loadPosts } from '@/lib/storage'
import { preparePostView } from '@/lib/view'

/**
 * Sorts posts by Unix `date` ascending (same order as the posts dashboard).
 * @param {object[]} posts Raw posts from storage.
 * @returns {object[]}
 */
export const sortPostsByDate = (posts) => [...posts].sort((a, b) => Number(a?.date || 0) - Number(b?.date || 0))

/**
 * Loads posts from storage and returns them sorted by date.
 * @returns {Promise<object[]>}
 */
export const loadSortedPosts = async () => {
  const allPosts = await loadPosts()
  return sortPostsByDate(allPosts)
}

/**
 * Builds SSR props for the paginated posts page.
 * @param {number} page Requested page number (1-based).
 * @returns {Promise<{ page: number, totalPages: number, totalPosts: number, posts: object[], pageSize: number }>}
 */
export const getPostsPagePayload = async (page) => {
  const pageSize = appConfig.pageSize
  const sortedPosts = await loadSortedPosts()
  const totalPosts = sortedPosts.length
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize))

  let resolvedPage = page
  if (!Number.isInteger(resolvedPage) || resolvedPage < 1) {
    resolvedPage = 1
  }
  resolvedPage = Math.min(resolvedPage, totalPages)

  const start = (resolvedPage - 1) * pageSize
  const posts = sortedPosts.slice(start, start + pageSize).map(preparePostView)

  return {
    page: resolvedPage,
    totalPages,
    totalPosts,
    posts,
    pageSize,
  }
}

/**
 * Returns a slice of prepared post view models (for API backfill).
 * @param {number} offset Global index in the sorted list.
 * @param {number} limit Number of posts (capped to `pageSize`, minimum 1).
 * @returns {Promise<{ posts: object[], totalPosts: number }>}
 */
export const getPostsSlicePayload = async (offset, limit) => {
  const pageSize = appConfig.pageSize
  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
  const rawLimit = Math.floor(Number(limit) || 1)
  const safeLimit = Math.min(pageSize, Math.max(1, rawLimit))

  const sortedPosts = await loadSortedPosts()
  const totalPosts = sortedPosts.length
  const posts = sortedPosts.slice(safeOffset, safeOffset + safeLimit).map(preparePostView)

  return { posts, totalPosts }
}
