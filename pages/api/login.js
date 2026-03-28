import { checkLoginCredentials } from '@/lib/auth'
import { appConfig } from '@/lib/config'
import { buildSetSessionUserCookieHeader } from '@/lib/sessionCookie'

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const username = String(req.body?.username || '')
  const password = String(req.body?.password || '')

  if (!checkLoginCredentials({ username, password })) {
    res.redirect(303, '/login?error=1')
    return
  }

  res.setHeader('Set-Cookie', buildSetSessionUserCookieHeader(appConfig.authUser))
  res.redirect(303, '/')
}

export default handler
