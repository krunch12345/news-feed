import Link from 'next/link'
import { DynamicFeed } from '@mui/icons-material'
import { Button, Stack, Typography } from '@mui/material'

const NotFoundPage = () => (
  <Stack spacing={2} alignItems='center' justifyContent='center' minHeight='100vh' padding={2}>
    <Typography variant='h1'>404</Typography>
    <Typography variant='h4'>Страница не найдена</Typography>

    <Typography color='text.secondary'>Проверьте адрес или вернитесь на страницу постов.</Typography>
    
    <Button component={Link} href='/posts' variant='contained' color='success' startIcon={<DynamicFeed />}>
      Перейти к постам
    </Button>
  </Stack>
)

export default NotFoundPage
