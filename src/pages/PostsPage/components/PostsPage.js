import { Children, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Stack, Typography } from '@mui/material'
import { DeleteConfirmModal } from '@/common/components/DeleteConfirmModal/components/DeleteConfirmModal'
import { buildDeleteDialogText } from '@/common/components/DeleteConfirmModal/utils/buildDeleteDialogText'
import { StyledPagination } from '@/common/components/StyledPagination/components/StyledPagination'
import { TitleSummary } from '@/common/components/TitleSummary/components/TitleSummary'
import { RELOAD_DELAY_MS } from '@/common/constants/loadingTimings'
import { useAppAlert } from '@/common/hooks/useAppAlert'
import { MainLayout } from '@/layouts/MainLayout/components/MainLayout'
import { ImagePreviewModal } from '@/pages/PostsPage/components/ImagePreviewModal'
import { PostCard } from '@/pages/PostsPage/components/PostCard'
import { useImagePreviewHotkeys } from '@/pages/PostsPage/hooks/useImagePreviewHotkeys'
import { buildPostText } from '@/pages/PostsPage/utils/buildPostText'

/**
 * Renders the main posts page component.
 * @param {object} props Component props.
 * @param {number} props.page Current page number.
 * @param {number} props.totalPages Total number of pages.
 * @param {number} props.totalPosts Total number of posts.
 * @param {object[]} props.posts List of post view models.
 * @returns {JSX.Element} Posts page component.
 */
export const PostsPage = ({ page, totalPages, totalPosts, posts }) => {
  const { showAlert } = useAppAlert()
  const [confirmState, setConfirmState] = useState({ type: '', value: '' })
  const [previewImages, setPreviewImages] = useState([])
  const [previewImageIndex, setPreviewImageIndex] = useState(0)

  const previewImageUrl = previewImages[previewImageIndex] || ''
  const deleteDialogText = useMemo(() => buildDeleteDialogText(confirmState, posts, []), [confirmState, posts])

  useImagePreviewHotkeys({
    previewImageUrl,
    previewImages,
    setPreviewImageIndex,
  })

  const onDeleteConfirm = async () => {
    if (confirmState.value) {
      try {
        const response = await fetch(`/api/delete/${encodeURIComponent(confirmState.value)}`, { method: 'POST' })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          showAlert('error', data?.message || 'Ошибка при удалении поста')
          return
        }

        showAlert('success', 'Пост удален', { persistOnReload: true })
        window.setTimeout(() => {
          window.location.reload()
        }, RELOAD_DELAY_MS)
      } catch {
        showAlert('error', 'Ошибка при удалении поста')
      }
    }
  }

  const closeConfirmDialog = () => {
    setConfirmState({ type: '', value: '' })
  }

  const openPreview = (images, index) => {
    setPreviewImages(images)
    setPreviewImageIndex(index)
  }

  const closePreview = () => {
    setPreviewImages([])
    setPreviewImageIndex(0)
  }

  const onCopyClick = async (post) => {
    try {
      await navigator.clipboard.writeText(buildPostText(post))
      showAlert('success', 'Текст скопирован')
    } catch {
      showAlert('error', 'Не удалось скопировать текст')
    }
  }

  const postCards = Children.toArray(
    posts.map((post) => (
      <PostCard
        post={post}
        onCopyClick={onCopyClick}
        onDeleteClick={(postId) => setConfirmState({ type: 'post', value: postId })}
        onOpenPreview={openPreview}
      />
    )),
  )

  return (
    <MainLayout>
      <Stack spacing={2}>
        <TitleSummary>всего постов: {totalPosts}</TitleSummary>
        
        {posts.length ? (
          <>
            <StyledPagination page={page} totalPages={totalPages} basePath='/posts' />
            {postCards}
            <StyledPagination page={page} totalPages={totalPages} basePath='/posts' />
          </>
        ) : (
          <Typography color='text.secondary' textAlign='center'>
            Постов нет
          </Typography>
        )}
      </Stack>

      <DeleteConfirmModal
        open={Boolean(confirmState.type)}
        deleteDialogText={deleteDialogText}
        onClose={closeConfirmDialog}
        onConfirm={onDeleteConfirm}
      />

      <ImagePreviewModal
        previewImageUrl={previewImageUrl}
        previewImages={previewImages}
        onClose={closePreview}
        onPrev={() => setPreviewImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length)}
        onNext={() => setPreviewImageIndex((prev) => (prev + 1) % previewImages.length)}
      />
    </MainLayout>
  )
}

PostsPage.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalPosts: PropTypes.number.isRequired,
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      group: PropTypes.string,
      date_human: PropTypes.string,
      text: PropTypes.string,
      url: PropTypes.string,
      attachments_view: PropTypes.string,
      postImages: PropTypes.arrayOf(PropTypes.string),
    }),
  ).isRequired,
}
