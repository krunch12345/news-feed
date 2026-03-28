import { buildClearSessionUserCookieHeader } from '@/lib/sessionCookie'

const handler = async (_req, res) => {
  res.setHeader('Set-Cookie', buildClearSessionUserCookieHeader())
  res.redirect(303, '/login')
}

export default handler
