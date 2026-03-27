/**
 * Builds a human-readable label for the delete confirmation dialog
 * based on selected entity type and value.
 *
 * @param {{type: string, value: string}} confirmState Current confirmation target.
 * @param {Array<{id: string, group?: string, date_human?: string}>} posts Available posts.
 * @param {Array<{id: string, name: string}>} groups Available groups.
 * @returns {string} Dialog text for the selected target or empty string.
 */
export const buildDeleteDialogText = (confirmState, posts, groups) => {
  if (!confirmState.type || !confirmState.value) {
    return ''
  }

  if (confirmState.type === 'post') {
    const post = posts.find((item) => item.id === confirmState.value)
    const groupName = post?.group || 'сообщество'
    const timing = post?.date_human
    return timing ? `${groupName} (${timing})` : groupName
  }

  if (confirmState.type === 'schedule') {
    return String(confirmState.value)
  }

  if (confirmState.type === 'group') {
    const group = groups.find((item) => item.id === confirmState.value)
    return group?.name || confirmState.value
  }

  return ''
}
