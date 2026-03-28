/**
 * Normalizes a session user string from cookie or env (trim + URI decode when valid).
 * @param {string | undefined} value Raw value.
 * @returns {string}
 */
export const normalizeSessionUserValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return ''
  }

  const trimmed = String(value).trim()
  if (trimmed === '') {
    return ''
  }

  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

/**
 * Returns whether the session cookie matches the configured user.
 * @param {string | undefined} cookieValue Value of session_user cookie.
 * @param {string | undefined} expectedUser AUTH_USER (or equivalent).
 * @returns {boolean}
 */
export const sessionUserMatches = (cookieValue, expectedUser) => {
  const a = normalizeSessionUserValue(cookieValue)
  const b = normalizeSessionUserValue(expectedUser)
  return a !== '' && b !== '' && a === b
}

const buildCookieBaseParts = () => {
  const parts = ['Path=/', 'HttpOnly', 'SameSite=Lax']
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure')
  }
  return parts
}

/**
 * Set-Cookie header value for a successful login session.
 * @param {string} authUser Configured username.
 * @returns {string}
 */
export const buildSetSessionUserCookieHeader = (authUser) => {
  const normalized = normalizeSessionUserValue(authUser)
  const value = encodeURIComponent(normalized)
  return [`session_user=${value}`, ...buildCookieBaseParts()].join('; ')
}

/**
 * Set-Cookie header value that clears session_user.
 * @returns {string}
 */
export const buildClearSessionUserCookieHeader = () => {
  return ['session_user=', ...buildCookieBaseParts(), 'Max-Age=0'].join('; ')
}
