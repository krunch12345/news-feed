import PropTypes from 'prop-types'
import { Stack } from '@mui/material'
import { AppHeader } from '@/common/components/AppHeader/components/AppHeader'
import { ScrollTopFab } from '@/common/components/ScrollTopFab/components/ScrollTopFab'
import { useMyLocation } from '@/common/hooks/useMyLocation'
import { useScrollTopVisibility } from '@/layouts/MainLayout/hooks/useScrollTopVisibility'

/**
 * Renders the main layout component.
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Child components to render.
 * @returns {JSX.Element} Main layout component.
 */
export const MainLayout = ({ children }) => {
  const isScrollTopVisible = useScrollTopVisibility()
  const location = useMyLocation()

  return (
    <Stack spacing={0}>
      <AppHeader location={location} />

      <Stack
        spacing={2}
        maxWidth={1080}
        margin='0 auto'
        paddingX={2}
        paddingTop={2}
        paddingBottom={2}
        width='100%'
        alignSelf='center'
      >
        {children}
      </Stack>

      <ScrollTopFab visible={isScrollTopVisible} />
    </Stack>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
}
