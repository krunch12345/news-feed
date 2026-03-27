import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Backdrop, Box, keyframes } from '@mui/material'
import { AppLogo } from '@/common/components/AppLogo'
import { RELOAD_DELAY_MS } from '@/common/constants/loadingTimings'

const FADE_OUT_DURATION = 50

const loadingScale = keyframes`
  0%, 100% {
    transform: scale(0.9);
  }
  80% {
    transform: scale(1.1);
  }
`

const loadingRotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  70% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

/**
 * Renders a global loading backdrop with animated logo.
 * @param {object} props Component props.
 * @param {boolean} props.open Backdrop visibility state.
 * @returns {JSX.Element} Loading overlay component.
 */
export const LoadingBackdrop = ({ open }) => {
  const [glitch, setGlitch] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const showStartTimeRef = useRef(null)
  const hideTimeoutRef = useRef(null)
  const fadeOutTimeoutRef = useRef(null)

  useEffect(() => {
    if (open) {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      if (fadeOutTimeoutRef.current) {
        window.clearTimeout(fadeOutTimeoutRef.current)
        fadeOutTimeoutRef.current = null
      }

      if (showStartTimeRef.current === null) {
        showStartTimeRef.current = Date.now()
      }

      setShouldRender(true)
      setIsVisible(true)
      return
    }

    if (showStartTimeRef.current !== null) {
      const elapsedTime = Date.now() - showStartTimeRef.current
      const remainingTime = Math.max(0, RELOAD_DELAY_MS - elapsedTime)

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current)
      }

      hideTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false)

        if (fadeOutTimeoutRef.current) {
          window.clearTimeout(fadeOutTimeoutRef.current)
        }

        fadeOutTimeoutRef.current = window.setTimeout(() => {
          setShouldRender(false)
          showStartTimeRef.current = null
          hideTimeoutRef.current = null
          fadeOutTimeoutRef.current = null
        }, FADE_OUT_DURATION)
      }, remainingTime)
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      if (fadeOutTimeoutRef.current) {
        window.clearTimeout(fadeOutTimeoutRef.current)
        fadeOutTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    const glitchInterval = window.setInterval(() => {
      setGlitch(true)
      window.setTimeout(() => setGlitch(false), 400)
    }, 1000 + Math.random() * 1500)

    return () => {
      window.clearInterval(glitchInterval)
    }
  }, [isVisible])

  if (!shouldRender) {
    return null
  }

  return (
    <Backdrop
      open={isVisible}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 2,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${FADE_OUT_DURATION}ms ease-in-out`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: '80vmin', sm: '60vmin' },
          height: { xs: '80vmin', sm: '60vmin' },
          maxWidth: 420,
          maxHeight: 420,
          animation: `${loadingScale} 3s ease-in-out infinite`,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: `${loadingRotate} 3s ease-in-out infinite`,
          }}
        >
          <AppLogo
            sx={{
              position: 'absolute',
              fontSize: { xs: '2.4rem', sm: '3rem' },
            }}
          />
          <AppLogo
            sx={{
              position: 'absolute',
              fontSize: { xs: '2.4rem', sm: '3rem' },
              color: '#88ff9d',
              opacity: glitch ? 0.55 : 0.28,
              transform: glitch ? 'translate(6px, -2px)' : 'translate(1px, 0)',
            }}
          />
          <AppLogo
            sx={{
              position: 'absolute',
              fontSize: { xs: '2.4rem', sm: '3rem' },
              color: '#15a83f',
              opacity: glitch ? 0.55 : 0.28,
              transform: glitch ? 'translate(-6px, 2px)' : 'translate(-1px, 0)',
            }}
          />
        </Box>
      </Box>
    </Backdrop>
  )
}

LoadingBackdrop.propTypes = {
  open: PropTypes.bool.isRequired,
}
