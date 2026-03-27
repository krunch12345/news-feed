/**
 * Builds a copy-ready multiline post text.
 * @param {object} post Post view model.
 * @returns {string}
 */
export const buildPostText = (post) => {
  const lines = []

  post.date_human && lines.push(`🗓 ${post.date_human}`)
  post.group && lines.push(`📌 ${post.group}`)
  post.text && lines.push('', post.text)
  post.attachments_view && lines.push('', `Вложения: ${post.attachments_view}`)
  post.url && lines.push('', `🔗 ${post.url}`)

  return lines.join('\n')
}
