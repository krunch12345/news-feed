import { NextResponse } from 'next/server'
import { sessionUserMatches } from '@/lib/sessionCookie'

const isPublicPath = (pathname) => {
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return true
  }
  if (pathname.startsWith('/api/login')) {
    return true
  }
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return true
  }
  return false
}

export const middleware = (request) => {
  const authUser = process.env.AUTH_USER || ''
  const authPass = process.env.AUTH_PASS || ''

  if (!authUser && !authPass) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const sessionUser = request.cookies.get('session_user')?.value
  if (sessionUserMatches(sessionUser, authUser)) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!.*\\..*).*)'],
}
