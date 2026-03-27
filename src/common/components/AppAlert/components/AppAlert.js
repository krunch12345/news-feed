import PropTypes from 'prop-types'
import { Close } from '@mui/icons-material'
import { Alert, AlertTitle, IconButton, LinearProgress, Snackbar, Stack } from '@mui/material'

/**
 * Renders app-level feedback alert in a snackbar.
 * @param {object} props Component props.
 * @param {boolean} props.open Controls snackbar visibility.
 * @param {'success'|'error'|'warning'|'info'} props.severity Alert severity.
 * @param {string} props.message Alert message.
 * @param {number} props.progress Remaining progress in percent.
 * @param {number} props.autoHideDuration Auto close delay in milliseconds.
 * @param {() => void} props.onClose Callback for closing the alert.
 * @returns {JSX.Element} Alert snackbar component.
 */
export const AppAlert = ({
  open,
  severity,
  message,
  progress,
  autoHideDuration,
  onClose,
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  >
    <Alert
      severity={severity}
      action={(
        <IconButton size='small' color='inherit' onClick={onClose} aria-label='Закрыть уведомление'>
          <Close fontSize='small' />
        </IconButton>
      )}
    >
      <AlertTitle sx={{ textTransform: 'capitalize', minWidth: '15rem' }}>
        {severity}
      </AlertTitle>

      {message}

      <Stack marginTop={1}>
        <LinearProgress variant='determinate' value={progress} color={severity} />
      </Stack>
    </Alert>
  </Snackbar>
)

AppAlert.propTypes = {
  open: PropTypes.bool.isRequired,
  severity: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  message: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  autoHideDuration: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
}
