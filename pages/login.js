import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { Login } from '@mui/icons-material'
import PropTypes from 'prop-types'
import { isFrontendAuthenticatedFromRequest } from '@/lib/auth'

/**
 * Renders the login page with credential form.
 * @param {object} props
 * @param {boolean} props.hasError Shows invalid credentials alert.
 * @returns {JSX.Element}
 */
const LoginPage = ({ hasError }) => (
  <Stack minHeight='100vh' justifyContent='center' alignItems='center' padding={2}>
    <Card sx={{ width: '100%', maxWidth: 420 }}>
      <CardContent>
        <Stack component='form' method='post' action='/api/login' spacing={2}>
          <Typography variant='h5' textAlign='center'>
            Вход
          </Typography>

          {hasError ? <Alert severity='error'>Неверный логин или пароль</Alert> : null}

          <TextField label='Логин' name='username' required fullWidth />

          <TextField label='Пароль' name='password' type='password' required fullWidth />

          <Button type='submit' variant='outlined' color='success' startIcon={<Login />} fullWidth>
            Войти
          </Button>
        </Stack>
      </CardContent>
    </Card>
  </Stack>
)

LoginPage.propTypes = {
  hasError: PropTypes.bool.isRequired,
}

/**
 * Redirects authenticated users away from login page.
 * @param {object} context Next.js server-side context.
 * @returns {Promise<{redirect: {destination: string, permanent: boolean}} | {props: {hasError: boolean}}>}
 */
export const getServerSideProps = async ({ req, query }) => {
  if (isFrontendAuthenticatedFromRequest(req)) {
    return {
      redirect: { destination: '/', permanent: false },
    }
  }

  return { props: { hasError: query?.error === '1' } }
}

export default LoginPage
