import { isFrontendAuthenticatedFromRequest } from '@/lib/auth'
const HomePage = () => null

/**
 * Redirects root route to posts route and enforces auth redirect.
 * @param {object} context Next.js server-side context.
 * @returns {Promise<{redirect: {destination: string, permanent: boolean}} | {props: object}>}
 */
export const getServerSideProps = async ({ req }) => {
  if (!isFrontendAuthenticatedFromRequest(req)) {
    return {
      redirect: { destination: '/login', permanent: false },
    }
  }

  return {
    redirect: { destination: '/posts', permanent: false },
  }
}

export default HomePage
