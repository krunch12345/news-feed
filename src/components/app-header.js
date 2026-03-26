'use client'

import Link from 'next/link'
import PropTypes from 'prop-types'
import { Button, Paper, Stack, Typography } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import LogoutIcon from '@mui/icons-material/Logout'

/**
 * Renders the sticky top header with logo, summary and actions.
 * @param {object} props
 * @param {string} props.activeTab Active dashboard tab.
 * @param {string} props.titleSummary Center summary text.
 * @returns {JSX.Element}
 */
export const AppHeader = ({ activeTab, titleSummary }) => {
  return (
    <Paper
      component='header'
      elevation={8}
      position='sticky'
      top={0}
      zIndex={1200}
      width='100%'
      sx={{
        backgroundColor: 'rgba(18, 25, 14, 0.49)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(45, 54, 45, 0.04)',
        boxShadow: '0 8px 20px rgba(55, 158, 69, 0.2)',
        borderRadius: 0,
      }}
    >
      <Stack
        margin='0 auto'
        width='100%'
        maxWidth={1400}
        paddingX={2}
        paddingY={1.5}
        display='grid'
        alignItems='center'
        sx={{
          gridTemplateColumns: '1fr auto 1fr',
          gap: 1.5,
        }}
      >
        <Typography
          component={Link}
          href='/?tab=posts'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          variant='h5'
          color='inherit'
          sx={{
            textDecoration: 'none',
            fontWeight: 700,
            fontFamily: '\'TagType\', \'Bahnschrift\', \'Roboto Condensed\', \'Arial Narrow\', sans-serif',
            fontSize: '2rem',
            lineHeight: 0.98,
            letterSpacing: '0.04em',
            fontStyle: 'italic',
            transform: 'skew(-7deg) rotate(-0.5deg)',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.55)',
          }}
        >
          моя вк лента
        </Typography>

        <Typography variant='body2' textAlign='center' noWrap>
          {titleSummary}
        </Typography>

        <Stack direction='row' spacing={1} justifySelf='end'>
          <Button component={Link} href={`/?tab=${activeTab}`} variant='contained' size='small' startIcon={<RefreshIcon />}>
            Обновить
          </Button>
          <Button component={Link} href='/api/logout' variant='outlined' size='small' color='error' startIcon={<LogoutIcon />}>
            Выйти
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

AppHeader.propTypes = {
  activeTab: PropTypes.string.isRequired,
  titleSummary: PropTypes.string.isRequired,
}
