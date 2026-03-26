import path from 'node:path'

const rootDir = process.cwd()

const getEnv = (name, fallback = '') => process.env[name] || fallback

export const appConfig = {
  rootDir,
  dataDir: getEnv('DATA_DIR', path.join(rootDir, 'data')),
  postsImagesDir: getEnv('POSTS_IMAGES_DIR', path.join(rootDir, 'postsImages')),
  pageSize: Number.parseInt(getEnv('PAGE_SIZE', '20'), 10) || 20,
  authUser: getEnv('AUTH_USER'),
  authPass: getEnv('AUTH_PASS'),
  vkToken: getEnv('VK_TOKEN'),
  vkApiVersion: getEnv('VK_API_VERSION', '5.131'),
  vkRequestDelayMs: Math.floor((Number.parseFloat(getEnv('VK_REQUEST_DELAY', '0.5')) || 0.5) * 1000),
  maxPosts: Number.parseInt(getEnv('MAX_POSTS', '500'), 10) || 500,
}
