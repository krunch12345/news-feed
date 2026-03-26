import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { isFrontendAuthenticatedFromRequest } from '@/lib/auth'

const LoginPage = ({ hasError }) => {
  return (
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
            <Button type='submit' variant='contained' fullWidth>
              Войти
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

LoginPage.propTypes = {
  hasError: PropTypes.bool.isRequired,
}

export const getServerSideProps = async ({ req, query }) => {
  if (isFrontendAuthenticatedFromRequest(req)) {
    return {
      redirect: { destination: '/', permanent: false },
    }
  }

  return { props: { hasError: query?.error === '1' } }
}

export default LoginPage
