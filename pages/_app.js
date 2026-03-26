import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import PropTypes from 'prop-types'
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
  },
})

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}

export default App
