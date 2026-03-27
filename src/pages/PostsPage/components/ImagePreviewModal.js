import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight, Close } from '@mui/icons-material'
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material'

/**
 * Renders a modal dialog for image preview.
 * @param {object} props Component props.
 * @param {string} props.previewImageUrl Current preview image URL.
 * @param {string[]} props.previewImages List of preview images.
 * @param {() => void} props.onClose Callback for closing the dialog.
 * @param {() => void} props.onPrev Callback for previous image.
 * @param {() => void} props.onNext Callback for next image.
 */
export const ImagePreviewModal = ({ previewImageUrl, previewImages, onClose, onPrev, onNext }) => (
  <Dialog
    open={Boolean(previewImageUrl)}
    onClose={onClose}
    maxWidth='lg'
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
        <Typography variant='h6'>Изображения</Typography>

        <IconButton color='error' onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>
    </DialogTitle>

    <DialogContent sx={{ overflow: 'hidden', pb: 2 }}>
      {previewImageUrl ? (
        <Stack direction='row' spacing={1} alignItems='center' justifyContent='center' sx={{ minHeight: '70vh', overflow: 'hidden' }}>
          {previewImages.length > 1 ? (
            <IconButton color='success' onClick={onPrev}>
              <ChevronLeft />
            </IconButton>
          ) : null}

          <Box
            component='img'
            src={previewImageUrl}
            alt='Полный размер изображения'
            sx={{
              width: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />
          
          {previewImages.length > 1 ? (
            <IconButton color='success' onClick={onNext}>
              <ChevronRight />
            </IconButton>
          ) : null}
        </Stack>
      ) : null}
    </DialogContent>
  </Dialog>
)

ImagePreviewModal.propTypes = {
  previewImageUrl: PropTypes.string.isRequired,
  previewImages: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
}
