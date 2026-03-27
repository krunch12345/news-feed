import PropTypes from 'prop-types'
import { Typography } from '@mui/material'
import { LOGO_TYPOGRAPHY_SX } from '@/common/components/AppHeader/constants/logoTypographySx'

/**
 * Renders the shared application logo text.
 * @param {object} props Component props.
 * @param {object} props.sx Additional MUI sx styles.
 * @returns {JSX.Element} Logo component.
 */
export const AppLogo = ({ sx = {}, ...props }) => (
  <Typography
    variant='h5'
    color='inherit'
    data-text='моя вк лента'
    sx={{ ...LOGO_TYPOGRAPHY_SX, ...sx }}
    {...props}
  >
    моя вк лента
  </Typography>
)

AppLogo.propTypes = {
  sx: PropTypes.object,
}
