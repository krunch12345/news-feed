import { Children } from 'react'
import PropTypes from 'prop-types'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { PostCardControls } from '@/pages/PostsPage/components/PostCardControls'
import { POST_CARD_CONTAINER_SX } from '@/pages/PostsPage/constants/postCardContainerSx'

/**
 * Renders a card component for a post.
 * @param {object} props Component props.
 * @param {object} props.post Post view model.
 * @param {() => void} props.onCopyClick Callback for copying post text.
 * @param {() => void} props.onDeleteClick Callback for deleting the post.
 * @param {() => void} props.onOpenPreview Callback for opening the image preview.
 */
export const PostCard = ({ post, onCopyClick, onDeleteClick, onOpenPreview }) => {
  const postImages = Children.toArray(
    (post.postImages || []).map((imageName, imageIndex) => (
      <Box
        component='img'
        src={`/api/images/${imageName}`}
        alt='Изображение поста'
        onClick={() =>
          onOpenPreview(
            (post.postImages || []).map((item) => `/api/images/${item}`),
            imageIndex,
          )
        }
        sx={{
          width: 'auto',
          maxWidth: '100%',
          maxHeight: 160,
          borderRadius: 2,
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          transform: 'scale(1)',
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-in-out',
          cursor: 'zoom-in',
          '&:hover': {
            transform: 'scale(1.55)',
            zIndex: 20,
          },
        }}
      />
    )),
  )

  return (
    <Card sx={POST_CARD_CONTAINER_SX}>
      <CardContent
        sx={{
          position: 'relative',
          zIndex: 1,
          borderRadius: '20px',
          overflow: 'visible',
          backgroundImage:
            'linear-gradient(135deg, rgba(5, 14, 11, 0.94) 0%, rgba(8, 26, 19, 0.88) 50%, rgba(13, 34, 26, 0.8) 100%)',
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6' fontWeight={700}>
              {post.group}
            </Typography>

            <Typography variant='body2'>{post.date_human}</Typography>
          </Stack>

          <Typography whiteSpace='pre-line'>{post.text || 'Без текста'}</Typography>

          {postImages.length ? (
            <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' justifyContent='center'>
              {postImages}
            </Stack>
          ) : null}

          {post.attachments_view ? (
            <Typography variant='body2' color='text.secondary'>
              Вложения: {post.attachments_view}
            </Typography>
          ) : null}

          <PostCardControls post={post} onCopyClick={onCopyClick} onDeleteClick={onDeleteClick} />
        </Stack>
      </CardContent>
    </Card>
  )
}

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    group: PropTypes.string,
    date_human: PropTypes.string,
    text: PropTypes.string,
    url: PropTypes.string,
    attachments_view: PropTypes.string,
    postImages: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onCopyClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onOpenPreview: PropTypes.func.isRequired,
}
