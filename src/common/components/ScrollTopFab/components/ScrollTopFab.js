import PropTypes from 'prop-types'
import { KeyboardArrowUp } from '@mui/icons-material'
import { Fab } from '@mui/material'

/**
 * Renders a floating action button that scrolls the window to top.
 *
 * @param {object} props Component props.
 * @param {boolean} props.visible Controls button visibility.
 * @returns {JSX.Element|null} Floating button or null when hidden.
 */
export const ScrollTopFab = ({ visible }) => {
  if (!visible) {
    return null
  }

  return (
    <Fab
      color='success'
      size='small'
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      sx={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 1300,
      }}
    >
      <KeyboardArrowUp />
    </Fab>
  )
}

ScrollTopFab.propTypes = {
  visible: PropTypes.bool.isRequired,
}
