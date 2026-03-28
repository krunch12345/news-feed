import { appConfig } from '@/lib/config'
import { sessionUserMatches } from '@/lib/sessionCookie'

export const isFrontendAuthEnabled = () => Boolean(appConfig.authUser || appConfig.authPass)

export const checkLoginCredentials = ({ username, password }) => {
  return Boolean(appConfig.authUser && appConfig.authPass && username === appConfig.authUser && password === appConfig.authPass)
}

export const isFrontendAuthenticated = () => !isFrontendAuthEnabled()

export const isFrontendAuthenticatedFromRequest = (request) => {
  if (!isFrontendAuthEnabled()) {
    return true
  }
  return sessionUserMatches(request?.cookies?.session_user, appConfig.authUser)
}

export const isRequestAuthorizedFromNodeRequest = (request) => {
  if (!isFrontendAuthEnabled()) {
    return true
  }
  return isFrontendAuthenticatedFromRequest(request)
}
