'use client'

import { useState } from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import {
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material'
import {
  DynamicFeed,
  Groups,
  Logout,
  Menu as MenuIcon,
  Refresh,
  Schedule,
} from '@mui/icons-material'
import { LOGO_TYPOGRAPHY_SX } from '@/components/AppHeader/constants/logoTypographySx'

/**
 * Renders the sticky top header with logo and navigation.
 * @param {object} props
 * @param {string} props.activeTab Active dashboard tab.
 * @returns {JSX.Element}
 */
export const AppHeader = ({ activeTab }) => {
  const [navMenuAnchorEl, setNavMenuAnchorEl] = useState(null)
  const isDesktop = useMediaQuery('(min-width:900px)')

  const isNavMenuOpen = Boolean(navMenuAnchorEl)

  const handleOpenNavMenu = (event) => {
    setNavMenuAnchorEl(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setNavMenuAnchorEl(null)
  }

  const tabHref = (tab) => `/?tab=${tab}`

  return (
    <Paper
      component='header'
      elevation={8}
      width='100%'
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
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
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        gap={2}
      >
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Typography
            component={Link}
            href='/?tab=posts'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant='h5'
            color='inherit'
            data-text='моя вк лента'
            sx={LOGO_TYPOGRAPHY_SX}
          >
            моя вк лента
          </Typography>

          {isDesktop ? (
            <>
              <Button
                component={Link}
                href={tabHref('posts')}
                size='small'
                variant={activeTab === 'posts' ? 'contained' : 'text'}
                color='success'
                startIcon={<DynamicFeed />}
              >
                Посты
              </Button>
              <Button
                component={Link}
                href={tabHref('schedule')}
                size='small'
                variant={activeTab === 'schedule' ? 'contained' : 'text'}
                color='success'
                startIcon={<Schedule />}
              >
                Расписание
              </Button>
              <Button
                component={Link}
                href={tabHref('groups')}
                size='small'
                variant={activeTab === 'groups' ? 'contained' : 'text'}
                color='success'
                startIcon={<Groups />}
              >
                Сообщества
              </Button>
            </>
          ) : null}
        </Stack>

        {isDesktop ? (
          <Stack direction='row' spacing={1} alignItems='center'>
            <Button
              component={Link}
              href={tabHref(activeTab)}
              variant='outlined'
              color='success'
              size='small'
              startIcon={<Refresh />}
            >
              Обновить
            </Button>
            <Button component={Link} href='/api/logout' variant='outlined' size='small' color='error' startIcon={<Logout />}>
              Выйти
            </Button>
          </Stack>
        ) : (
          <>
            <IconButton
              size='large'
              color='success'
              aria-label='Открыть меню навигации'
              aria-controls={isNavMenuOpen ? 'app-header-nav-menu' : undefined}
              aria-haspopup='true'
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id='app-header-nav-menu'
              anchorEl={navMenuAnchorEl}
              open={isNavMenuOpen}
              onClose={handleCloseNavMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  backgroundColor: 'rgba(8, 12, 8, 0.96)',
                  backgroundImage: 'linear-gradient(135deg, rgba(5, 14, 11, 0.96) 0%, rgba(8, 26, 19, 0.9) 100%)',
                  border: '1px solid rgba(108, 255, 0, 0.25)',
                  minWidth: 220,
                },
              }}
            >
              <MenuItem
                component={Link}
                href={tabHref('posts')}
                selected={activeTab === 'posts'}
                onClick={handleCloseNavMenu}
                sx={{
                  color: '#d8ffe1',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(45, 120, 50, 0.45)',
                    color: '#ffffff',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(57, 158, 69, 0.52)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(45, 120, 50, 0.28)',
                  },
                }}
              >
                <DynamicFeed sx={{ mr: 1 }} /> Посты
              </MenuItem>
              <MenuItem
                component={Link}
                href={tabHref('schedule')}
                selected={activeTab === 'schedule'}
                onClick={handleCloseNavMenu}
                sx={{
                  color: '#d8ffe1',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(45, 120, 50, 0.45)',
                    color: '#ffffff',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(57, 158, 69, 0.52)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(45, 120, 50, 0.28)',
                  },
                }}
              >
                <Schedule sx={{ mr: 1 }} /> Расписание
              </MenuItem>
              <MenuItem
                component={Link}
                href={tabHref('groups')}
                selected={activeTab === 'groups'}
                onClick={handleCloseNavMenu}
                sx={{
                  color: '#d8ffe1',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(45, 120, 50, 0.45)',
                    color: '#ffffff',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(57, 158, 69, 0.52)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(45, 120, 50, 0.28)',
                  },
                }}
              >
                <Groups sx={{ mr: 1 }} /> Сообщества
              </MenuItem>
              <Divider />
              <MenuItem
                component={Link}
                href={tabHref(activeTab)}
                onClick={handleCloseNavMenu}
                sx={{
                  color: '#d8ffe1',
                  '&:hover': {
                    backgroundColor: 'rgba(45, 120, 50, 0.28)',
                  },
                }}
              >
                <Refresh sx={{ mr: 1 }} /> Обновить
              </MenuItem>
              <MenuItem
                component={Link}
                href='/api/logout'
                onClick={handleCloseNavMenu}
                sx={{
                  color: '#ffd6d6',
                  '&:hover': {
                    backgroundColor: 'rgba(128, 40, 40, 0.34)',
                  },
                }}
              >
                <Logout sx={{ mr: 1 }} /> Выйти
              </MenuItem>
            </Menu>
          </>
        )}
      </Stack>
    </Paper>
  )
}

AppHeader.propTypes = {
  activeTab: PropTypes.string.isRequired,
}
