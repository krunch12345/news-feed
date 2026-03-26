import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "../styles/globals.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#181a1f",
      paper: "#2e3338",
    },
  },
});

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default App;
