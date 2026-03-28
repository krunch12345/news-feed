import { useEffect, useState } from 'react'

/**
 * Custom hook to determine if the scroll-to-top button should be visible.
 * @returns {boolean} True if scroll position exceeds viewport height, false otherwise.
 */
export const useScrollTopVisibility = () => {
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false)

  useEffect(() => {
    const updateScrollTopVisibility = () => {
      const scrollTop = window.scrollY
      const threshold = window.innerHeight

      setIsScrollTopVisible(scrollTop > threshold)
    }

    updateScrollTopVisibility()

    window.addEventListener('resize', updateScrollTopVisibility, { passive: true })
    window.addEventListener('scroll', updateScrollTopVisibility, { passive: true })

    return () => {
      window.removeEventListener('resize', updateScrollTopVisibility)
      window.removeEventListener('scroll', updateScrollTopVisibility)
    }
  }, [])

  return isScrollTopVisible
}
