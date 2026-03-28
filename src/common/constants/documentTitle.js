/** @type {string} */
export const BASE_DOCUMENT_TITLE = 'Моя лента VK'

/** @type {Record<string, string>} */
const DOCUMENT_TITLE_SUFFIX_BY_PATHNAME = {
  '/posts': 'посты',
  '/schedule': 'расписание',
  '/groups': 'сообщества',
  '/login': 'логин',
}

/**
 * Returns the browser tab title for a Next.js route pathname.
 * @param {string} pathname
 * @returns {string}
 */
export const getDocumentTitle = (pathname) => {
  const suffix = DOCUMENT_TITLE_SUFFIX_BY_PATHNAME[pathname]
  return suffix ? `${BASE_DOCUMENT_TITLE}: ${suffix}` : BASE_DOCUMENT_TITLE
}
