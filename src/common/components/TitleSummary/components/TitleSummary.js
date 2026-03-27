import PropTypes from 'prop-types'
import { Typography } from '@mui/material'

/**
 * Renders dashboard section summary.
 * @param {object} props
 * @returns {JSX.Element}
 */
export const TitleSummary = ({ children }) => (
  <Typography variant='body2' textAlign='center' color='grey.600'>
    {children}
  </Typography>
)

TitleSummary.propTypes = {
  children: PropTypes.node.isRequired,
}
