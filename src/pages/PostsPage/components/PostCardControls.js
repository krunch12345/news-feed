import PropTypes from 'prop-types'
import { ContentCopy, DeleteForever } from '@mui/icons-material'
import { Button, Fab, Stack, Typography } from '@mui/material'

/**
 * Renders post card action controls.
 * @param {object} props Component props.
 * @param {object} props.post Post view model.
 * @param {(post: object) => void} props.onCopyClick Callback for copying post text.
 * @param {(postId: string) => void} props.onDeleteClick Callback for deleting the post.
 * @returns {JSX.Element} Controls section for post card.
 */
export const PostCardControls = ({ post, onCopyClick, onDeleteClick }) => (
  <Stack direction='row' justifyContent='space-between' alignItems='center'>
    <Button href={post.url} target='_blank' variant='text' color='success'>
      Открыть вк
    </Button>

    <Stack direction='row' spacing={1}>
      <Fab
        variant='extended'
        size='small'
        onClick={() => onCopyClick(post)}
        sx={{
          minWidth: 'auto',
          width: 34,
          height: 34,
          borderRadius: '50%',
          justifyContent: 'center',
          overflow: 'hidden',
          pl: 0.8,
          pr: 0.8,
          transition: 'all 0.25s ease',
          backgroundColor: 'transparent',
          color: 'success.main',
          boxShadow: 'none',
          '&:hover': {
            width: 'auto',
            borderRadius: 5,
            pl: 1.25,
            pr: 1.5,
            backgroundColor: 'success.dark',
            color: '#ffffff',
            boxShadow: 'none',
          },
          '&:hover .action-label-copy': {
            maxWidth: 120,
            opacity: 1,
            ml: 0.5,
          },
        }}
      >
        <ContentCopy />
        <Typography
          className='action-label-copy'
          sx={{
            maxWidth: 0,
            opacity: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            ml: 0,
            transition: 'max-width 0.25s ease, opacity 0.25s ease, margin-left 0.25s ease',
          }}
        >
          Копировать
        </Typography>
      </Fab>

      <Fab
        variant='extended'
        size='small'
        onClick={() => onDeleteClick(post.id)}
        sx={{
          minWidth: 'auto',
          width: 34,
          height: 34,
          borderRadius: '50%',
          justifyContent: 'center',
          overflow: 'hidden',
          pl: 0.8,
          pr: 0.8,
          transition: 'all 0.25s ease',
          backgroundColor: 'transparent',
          color: 'error.main',
          boxShadow: 'none',
          '&:hover': {
            width: 'auto',
            borderRadius: 5,
            pl: 1.25,
            pr: 1.5,
            backgroundColor: 'error.dark',
            color: '#ffffff',
            boxShadow: 'none',
          },
          '&:hover .action-label-delete': {
            maxWidth: 100,
            opacity: 1,
            ml: 0.5,
          },
        }}
      >
        <DeleteForever />
        <Typography
          className='action-label-delete'
          sx={{
            maxWidth: 0,
            opacity: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            ml: 0,
            transition: 'max-width 0.25s ease, opacity 0.25s ease, margin-left 0.25s ease',
          }}
        >
          Удалить
        </Typography>
      </Fab>
    </Stack>
  </Stack>
)

PostCardControls.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string,
  }).isRequired,
  onCopyClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
}
