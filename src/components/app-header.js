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
        position: 'relative',
        overflow: 'visible',
        backgroundColor: 'transparent',
        backgroundImage: 'linear-gradient(180deg, rgba(11, 37, 13, 0.82) 0%, rgba(11, 37, 13, 0.74) 62%, rgba(11, 37, 13, 0) 100%)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'none',
        borderRadius: 0,
      }}
    >
      <Stack
        margin='0 auto'
        width='100%'
        maxWidth={1680}
        paddingX={2}
        paddingY={1.5}
        display='grid'
        alignItems='center'
        sx={{
          gridTemplateColumns: '1fr auto 1fr',
          gridTemplateAreas: '"logo summary actions"',
          gap: 1.5,
          '@media (max-width:700px)': {
            gridTemplateColumns: '1fr auto',
            gridTemplateAreas: '"logo actions" "summary summary"',
            rowGap: 1.25,
            paddingTop: 2,
            paddingBottom: 2.25,
          },
        }}
      >
        <Typography
          component={Link}
          href='/?tab=posts'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          variant='h5'
          color='inherit'
          data-text='моя вк лента'
          sx={{
            gridArea: 'logo',
            position: 'relative',
            display: 'inline-block',
            textDecoration: 'none',
            fontWeight: 700,
            fontFamily: '\'TagType\', \'Bahnschrift\', \'Roboto Condensed\', \'Arial Narrow\', sans-serif',
            fontSize: '2.5rem',
            lineHeight: 0.98,
            letterSpacing: '0.04em',
            fontStyle: 'italic',
            transform: 'skew(-7deg) rotate(-0.5deg)',
            color: '#5dff7a',
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.85)',
            animation: 'logoCoreBurst 6.5s infinite steps(1, end)',
            '&::before, &::after': {
              content: 'attr(data-text)',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              pointerEvents: 'none',
              opacity: 0.28,
            },
            '&::before': {
              color: '#88ff9d',
              transform: 'translate(1px, 0)',
              clipPath: 'polygon(0 0, 100% 0, 100% 13%, 0 13%, 0 24%, 100% 24%, 100% 37%, 0 37%, 0 49%, 100% 49%, 100% 59%, 0 59%)',
              animation: 'logoGlitchTop 6.5s infinite steps(1, end)',
            },
            '&::after': {
              color: '#15a83f',
              transform: 'translate(-1px, 0)',
              clipPath: 'polygon(0 62%, 100% 62%, 100% 73%, 0 73%, 0 83%, 100% 83%, 100% 91%, 0 91%, 0 100%, 100% 100%)',
              animation: 'logoGlitchBottom 6.5s infinite steps(1, end)',
            },
            '@keyframes logoCoreBurst': {
              '0%, 93%, 100%': {
                transform: 'skew(-7deg) rotate(-0.5deg)',
                filter: 'none',
              },
              '94%': {
                transform: 'skew(-9deg) rotate(-0.8deg) translateX(-1px)',
                filter: 'contrast(1.2)',
              },
              '95%': {
                transform: 'skew(-5deg) rotate(0deg) translateX(1px)',
                filter: 'contrast(1.35)',
              },
              '96%': {
                transform: 'skew(-7deg) rotate(-0.5deg)',
                filter: 'none',
              },
            },
            '@keyframes logoGlitchTop': {
              '0%, 93%, 100%': {
                transform: 'translate(1px, 0)',
                opacity: 0.28,
              },
              '94%': {
                transform: 'translate(-6px, -2px)',
                opacity: 0.55,
              },
              '95%': {
                transform: 'translate(5px, 2px)',
                opacity: 0.48,
              },
              '96%': {
                transform: 'translate(-2px, 1px)',
                opacity: 0.4,
              },
              '97%': {
                transform: 'translate(1px, 0)',
                opacity: 0.28,
              },
            },
            '@keyframes logoGlitchBottom': {
              '0%, 93%, 100%': {
                transform: 'translate(-1px, 0)',
                opacity: 0.28,
              },
              '94%': {
                transform: 'translate(6px, 2px)',
                opacity: 0.55,
              },
              '95%': {
                transform: 'translate(-5px, -2px)',
                opacity: 0.48,
              },
              '96%': {
                transform: 'translate(2px, -1px)',
                opacity: 0.4,
              },
              '97%': {
                transform: 'translate(-1px, 0)',
                opacity: 0.28,
              },
            },
          }}
        >
          моя вк лента
        </Typography>

        <Typography
          variant='body2'
          textAlign='center'
          noWrap
          sx={{
            gridArea: 'summary',
            justifySelf: 'center',
            '@media (max-width:700px)': {
              width: '100%',
              marginTop: 0.25,
            },
          }}
        >
          {titleSummary}
        </Typography>

        <Stack direction='row' spacing={1} justifySelf='end' sx={{ gridArea: 'actions' }}>
          <Button
            component={Link}
            href={`/?tab=${activeTab}`}
            variant='outlined'
            color='success'
            size='small'
            startIcon={<RefreshIcon />}
          >
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
