'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import {
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
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
import { AppLogo } from '@/common/components/AppLogo'

const HeaderDesktopNav = ({ location }) => (
  <>
    <Button
      component='a'
      href='/posts'
      size='small'
      variant={location.isPosts ? 'contained' : 'text'}
      color='success'
      startIcon={<DynamicFeed />}
    >
      Посты
    </Button>

    <Button
      component='a'
      href='/schedule'
      size='small'
      variant={location.isSchedule ? 'contained' : 'text'}
      color='success'
      startIcon={<Schedule />}
    >
      Расписание
    </Button>

    <Button
      component='a'
      href='/groups'
      size='small'
      variant={location.isGroups ? 'contained' : 'text'}
      color='success'
      startIcon={<Groups />}
    >
      Сообщества
    </Button>
  </>
)

HeaderDesktopNav.propTypes = {
  location: PropTypes.shape({
    isPosts: PropTypes.bool.isRequired,
    isSchedule: PropTypes.bool.isRequired,
    isGroups: PropTypes.bool.isRequired,
  }).isRequired,
}

const HeaderMobileNav = ({
  location,
  currentPath,
  navMenuAnchorEl,
  isNavMenuOpen,
  onOpenNavMenu,
  onCloseNavMenu,
}) => (
  <>
    <IconButton
      size='large'
      color='success'
      aria-label='Открыть меню навигации'
      aria-controls={isNavMenuOpen ? 'app-header-nav-menu' : undefined}
      aria-haspopup='true'
      onClick={onOpenNavMenu}
    >
      <MenuIcon />
    </IconButton>

    <Menu
      id='app-header-nav-menu'
      anchorEl={navMenuAnchorEl}
      open={isNavMenuOpen}
      onClose={onCloseNavMenu}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'rgba(8, 12, 8, 0.96)',
            backgroundImage: 'linear-gradient(135deg, rgba(5, 14, 11, 0.96) 0%, rgba(8, 26, 19, 0.9) 100%)',
            border: '1px solid rgba(108, 255, 0, 0.25)',
            minWidth: 220,
          },
        },
      }}
    >
      <MenuItem
        component='a'
        href='/posts'
        selected={location.isPosts}
        onClick={onCloseNavMenu}
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
        component='a'
        href='/schedule'
        selected={location.isSchedule}
        onClick={onCloseNavMenu}
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
        component='a'
        href='/groups'
        selected={location.isGroups}
        onClick={onCloseNavMenu}
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
        component='a'
        href={currentPath}
        onClick={onCloseNavMenu}
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
        component='a'
        href='/api/logout'
        onClick={onCloseNavMenu}
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
)

HeaderMobileNav.propTypes = {
  location: PropTypes.shape({
    isPosts: PropTypes.bool.isRequired,
    isSchedule: PropTypes.bool.isRequired,
    isGroups: PropTypes.bool.isRequired,
  }).isRequired,
  currentPath: PropTypes.string.isRequired,
  navMenuAnchorEl: PropTypes.object,
  isNavMenuOpen: PropTypes.bool.isRequired,
  onOpenNavMenu: PropTypes.func.isRequired,
  onCloseNavMenu: PropTypes.func.isRequired,
}

/**
 * Renders the sticky top header with logo and navigation.
 * @param {object} props
 * @param {object} props.location Dashboard route flags.
 * @returns {JSX.Element}
 */
export const AppHeader = ({ location }) => {
  const router = useRouter()
  const [navMenuAnchorEl, setNavMenuAnchorEl] = useState(null)
  const isDesktop = useMediaQuery('(min-width:900px)')

  const isNavMenuOpen = Boolean(navMenuAnchorEl)

  const handleOpenNavMenu = (event) => {
    setNavMenuAnchorEl(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setNavMenuAnchorEl(null)
  }

  const currentPath = router.asPath || '/posts'

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
          <AppLogo
            component='a'
            href='/posts'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          {isDesktop ? <HeaderDesktopNav location={location} /> : null}
        </Stack>

        {isDesktop ? (
          <Stack direction='row' spacing={1} alignItems='center'>
            <Button
              component='a'
              href={currentPath}
              variant='outlined'
              color='success'
              size='small'
              startIcon={<Refresh />}
            >
              Обновить
            </Button>

            <Button
              component='a'
              href='/api/logout'
              variant='outlined'
              size='small'
              color='error'
              startIcon={<Logout />}
            >
              Выйти
            </Button>
          </Stack>
        ) : (
          <HeaderMobileNav
            location={location}
            currentPath={currentPath}
            navMenuAnchorEl={navMenuAnchorEl}
            isNavMenuOpen={isNavMenuOpen}
            onOpenNavMenu={handleOpenNavMenu}
            onCloseNavMenu={handleCloseNavMenu}
          />
        )}
      </Stack>
    </Paper>
  )
}

AppHeader.propTypes = {
  location: PropTypes.shape({
    isPosts: PropTypes.bool.isRequired,
    isSchedule: PropTypes.bool.isRequired,
    isGroups: PropTypes.bool.isRequired,
    isNotFound: PropTypes.bool.isRequired,
    pathname: PropTypes.string.isRequired,
  }).isRequired,
}
