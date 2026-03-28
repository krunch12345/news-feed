import { useEffect, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { getDocumentTitle } from '@/common/constants/documentTitle'
import PropTypes from 'prop-types'
import { AppAlert } from '@/common/components/AppAlert'
import { LoadingBackdrop } from '@/common/components/LoadingBackdrop'
import { AppAlertContext } from '@/common/hooks/useAppAlert'
import '../styles/globals.css'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#181a1f',
      paper: '#2e3338',
    },
    success: {
      main: '#66ff8a',
      light: '#8dffab',
      dark: '#4caf50',
      contrastText: '#0b1a0f',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#66ff8a',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.72)',
          '&.Mui-selected': {
            color: '#66ff8a',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#4caf50',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4caf50',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          '.Mui-focused &': {
            color: '#4caf50',
          },
        },
      },
    },
  },
})

const APP_ALERT_STORAGE_KEY = 'app.alert.payload'

const App = ({ Component, pageProps }) => {
  const router = useRouter()
  const [alertState, setAlertState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })
  const [progress, setProgress] = useState(100)
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState(0)

  const autoHideDuration = useMemo(
    () => (alertState.severity === 'error' ? 10000 : 5000),
    [alertState.severity],
  )

  const documentTitle = useMemo(
    () => getDocumentTitle(router.pathname),
    [router.pathname],
  )

  useEffect(() => {
    if (!alertState.open) {
      return
    }

    setProgress(100)
    const decrement = 100 / (autoHideDuration / 250)
    const timerId = window.setInterval(() => {
      setProgress((value) => Math.max(value - decrement, 0))
    }, 250)

    return () => {
      window.clearInterval(timerId)
    }
  }, [alertState.open, autoHideDuration])

  useEffect(() => {
    const rawValue = window.sessionStorage.getItem(APP_ALERT_STORAGE_KEY)

    if (rawValue) {
      window.sessionStorage.removeItem(APP_ALERT_STORAGE_KEY)

      try {
        const payload = JSON.parse(rawValue)
        if (payload?.severity && payload?.message) {
          setAlertState({
            open: true,
            severity: payload.severity,
            message: payload.message,
          })
        }
      } catch {
        return
      }
    }
  }, [])

  useEffect(() => {
    const handleRouteStart = () => {
      setIsRouteLoading(true)
    }

    const handleRouteEnd = () => {
      setIsRouteLoading(false)
    }

    router.events.on('routeChangeStart', handleRouteStart)
    router.events.on('routeChangeComplete', handleRouteEnd)
    router.events.on('routeChangeError', handleRouteEnd)

    return () => {
      router.events.off('routeChangeStart', handleRouteStart)
      router.events.off('routeChangeComplete', handleRouteEnd)
      router.events.off('routeChangeError', handleRouteEnd)
    }
  }, [router.events])

  useEffect(() => {
    const originalFetch = window.fetch.bind(window)

    window.fetch = async (...args) => {
      setPendingRequests((value) => value + 1)

      try {
        return await originalFetch(...args)
      } finally {
        setPendingRequests((value) => Math.max(value - 1, 0))
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  const closeAlert = () => {
    setAlertState((value) => ({ ...value, open: false }))
  }

  const showAlert = (severity, message, options = {}) => {
    if (options.persistOnReload) {
      window.sessionStorage.setItem(
        APP_ALERT_STORAGE_KEY,
        JSON.stringify({ severity, message }),
      )
    }

    setAlertState({
      open: true,
      severity,
      message,
    })
  }

  const isGlobalLoading = isRouteLoading || pendingRequests > 0

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>{documentTitle}</title>
      </Head>
      
      <AppAlertContext.Provider value={{ showAlert }}>
        <CssBaseline />
        <LoadingBackdrop open={isGlobalLoading} />
        <Component {...pageProps} />

        <AppAlert
          open={alertState.open}
          severity={alertState.severity}
          message={alertState.message}
          progress={progress}
          autoHideDuration={autoHideDuration}
          onClose={closeAlert}
        />
      </AppAlertContext.Provider>
    </ThemeProvider>
  )
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}

export default App
