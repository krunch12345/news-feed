import { useEffect, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import PropTypes from 'prop-types'
import { AppAlert } from '@/common/components/AppAlert'
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
            color: '#66ff8a',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#66ff8a',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          '.Mui-focused &': {
            color: '#66ff8a',
          },
        },
      },
    },
  },
})

const APP_ALERT_STORAGE_KEY = 'app.alert.payload'

const App = ({ Component, pageProps }) => {
  const [alertState, setAlertState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })
  const [progress, setProgress] = useState(100)

  const autoHideDuration = useMemo(
    () => (alertState.severity === 'error' ? 10000 : 5000),
    [alertState.severity],
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

  return (
    <ThemeProvider theme={theme}>
      <AppAlertContext.Provider value={{ showAlert }}>
        <CssBaseline />
        
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
