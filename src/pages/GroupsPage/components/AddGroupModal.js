import PropTypes from 'prop-types'
import { Add, Close } from '@mui/icons-material'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography, TextField } from '@mui/material'

/**
 * Renders a modal dialog for adding a group.
 * @param {object} props Component props.
 * @param {boolean} props.open Controls dialog visibility.
 * @param {string} props.groupId Group ID.
 * @param {string} props.groupName Group name.
 * @param {string} props.groupError Group error message.
 * @param {() => void} props.onClose Callback for closing the dialog.
 * @param {() => void} props.onGroupIdChange Callback for changing the group ID.
 * @param {() => void} props.onGroupNameChange Callback for changing the group name.
 * @param {() => void} props.onConfirm Callback for confirming the addition.
 * @returns {JSX.Element} Dialog component.
 */
export const AddGroupModal = ({
  open,
  groupId,
  groupName,
  groupError,
  onClose,
  onGroupIdChange,
  onGroupNameChange,
  onConfirm,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth='sm'
    slotProps={{
      backdrop: {
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.82)',
        },
      },
      paper: {
        sx: {
          backgroundColor: 'rgba(8, 12, 8, 0.96)',
          overflow: 'hidden',
        },
      },
    }}
  >
    <DialogTitle>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='h6'>Добавить сообщество</Typography>
        <IconButton color='error' onClick={onClose} aria-label='Закрыть'>
          <Close />
        </IconButton>
      </Stack>
    </DialogTitle>

    <DialogContent>
      <Stack spacing={2} paddingTop={1}>
        <TextField label='ID сообщества' value={groupId} onChange={onGroupIdChange} fullWidth />

        <TextField label='Название (необязательно)' value={groupName} onChange={onGroupNameChange} fullWidth />

        {groupError ? <Alert severity='error'>{groupError}</Alert> : null}
      </Stack>
    </DialogContent>

    <DialogActions>
      <Button color='error' onClick={onClose}>
        Отмена
      </Button>

      <Button color='success' variant='outlined' startIcon={<Add />} onClick={onConfirm}>
        Добавить
      </Button>
    </DialogActions>
  </Dialog>
)

AddGroupModal.propTypes = {
  open: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  groupName: PropTypes.string.isRequired,
  groupError: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onGroupIdChange: PropTypes.func.isRequired,
  onGroupNameChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}
