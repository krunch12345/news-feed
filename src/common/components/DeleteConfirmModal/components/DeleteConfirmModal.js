import PropTypes from 'prop-types'
import { Close, DeleteForever } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material'

/**
 * Renders a confirmation dialog for deleting an entity.
 * @param {object} props Component props.
 * @param {boolean} props.open Controls dialog visibility.
 * @param {string} props.deleteDialogText Text to display in the dialog.
 * @param {function} props.onClose Callback for closing the dialog.
 * @param {function} props.onConfirm Callback for confirming the deletion.
 * @returns {JSX.Element} Dialog component.
 */
export const DeleteConfirmModal = ({ open, deleteDialogText, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth='sm'
    fullWidth
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
        <Typography variant='h6'>Подтверждение удаления</Typography>

        <IconButton color='error' onClick={onClose} aria-label='Закрыть'>
          <Close />
        </IconButton>
      </Stack>
    </DialogTitle>

    <DialogContent sx={{ pt: 1 }}>
      {deleteDialogText ? (
        <Typography variant='h6' color='text.secondary'>
          {deleteDialogText}
        </Typography>
      ) : null}
    </DialogContent>

    <DialogActions>
      <Button color='success' onClick={onClose}>
        Отмена
      </Button>

      <Button color='error' variant='outlined' startIcon={<DeleteForever />} onClick={onConfirm}>
        Удалить
      </Button>
    </DialogActions>
  </Dialog>
)

DeleteConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  deleteDialogText: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}
