import { appConfig } from '@/lib/config'

const parseBasicAuth = (authorization = '') => {
  if (!authorization.startsWith('Basic ')) {
    return null
  }

  const encoded = authorization.slice(6).trim()
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8')
    const splitIndex = decoded.indexOf(':')
    if (splitIndex === -1) {
      return null
    }
    return {
      username: decoded.slice(0, splitIndex),
      password: decoded.slice(splitIndex + 1),
    }
  } catch {
    return null
  }
}

export const isFrontendAuthEnabled = () => Boolean(appConfig.authUser || appConfig.authPass)

export const checkLoginCredentials = ({ username, password }) => {
  return Boolean(appConfig.authUser && appConfig.authPass && username === appConfig.authUser && password === appConfig.authPass)
}

export const isFrontendAuthenticated = () => !isFrontendAuthEnabled()

export const isBasicAuthValid = (request) => {
  if (!appConfig.basicUser && !appConfig.basicPass) {
    return true
  }
  const parsed = parseBasicAuth(request.headers.get('authorization') || '')
  return Boolean(parsed && parsed.username === appConfig.basicUser && parsed.password === appConfig.basicPass)
}

const parseCookieHeader = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.split('=')
    if (!key) {
      return acc
    }
    acc[key.trim()] = decodeURIComponent(rest.join('=').trim())
    return acc
  }, {})
}

export const isRequestAuthorized = (request) => {
  if (isBasicAuthValid(request)) {
    return true
  }
  if (!isFrontendAuthEnabled()) {
    return false
  }
  const cookies = parseCookieHeader(request.headers.get('cookie') || '')
  return cookies.session_user === appConfig.authUser
}

export const isFrontendAuthenticatedFromRequest = (request) => {
  if (!isFrontendAuthEnabled()) {
    return true
  }
  return request?.cookies?.session_user === appConfig.authUser
}

export const isRequestAuthorizedFromNodeRequest = (request) => {
  if (!appConfig.basicUser && !appConfig.basicPass) {
    return true
  }
  const parsed = parseBasicAuth(request.headers.authorization || '')
  if (parsed && parsed.username === appConfig.basicUser && parsed.password === appConfig.basicPass) {
    return true
  }
  return isFrontendAuthenticatedFromRequest(request)
}
