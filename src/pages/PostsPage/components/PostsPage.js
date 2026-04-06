import { Children, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import { Stack, Typography } from '@mui/material'
import { DeleteConfirmModal } from '@/common/components/DeleteConfirmModal/components/DeleteConfirmModal'
import { buildDeleteDialogText } from '@/common/components/DeleteConfirmModal/utils/buildDeleteDialogText'
import { StyledPagination } from '@/common/components/StyledPagination/components/StyledPagination'
import { TitleSummary } from '@/common/components/TitleSummary/components/TitleSummary'
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
 * @param {number} props.totalPages Total number of pages from SSR (used until local totals diverge).
 * @param {number} props.totalPosts Total number of posts.
 * @param {number} props.pageSize Posts per page.
 * @param {object[]} props.posts List of post view models.
 * @returns {JSX.Element} Posts page component.
 */
export const PostsPage = ({ page, totalPages: _totalPagesSsr, totalPosts, pageSize, posts: postsProp }) => {
  const router = useRouter()
  const { showAlert } = useAppAlert()
  const [confirmState, setConfirmState] = useState({ type: '', value: '' })
  const [previewImages, setPreviewImages] = useState([])
  const [previewImageIndex, setPreviewImageIndex] = useState(0)
  const [posts, setPosts] = useState(postsProp)
  const [totalPostsState, setTotalPostsState] = useState(totalPosts)

  const previewImageUrl = previewImages[previewImageIndex] || ''
  const deleteDialogText = useMemo(() => buildDeleteDialogText(confirmState, posts, []), [confirmState, posts])

  const totalPages = Math.max(1, Math.ceil(totalPostsState / pageSize))

  useImagePreviewHotkeys({
    previewImageUrl,
    previewImages,
    setPreviewImageIndex,
  })

  const onDeleteConfirm = async () => {
    const postIdToDelete = confirmState.value
    if (!postIdToDelete) {
      return
    }

    try {
      const response = await fetch(`/api/delete/${encodeURIComponent(postIdToDelete)}`, { method: 'POST' })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        showAlert('error', data?.message || 'Ошибка при удалении поста')
        return
      }

      const serverTotal = Number(data?.totalPosts)
      if (!Number.isFinite(serverTotal)) {
        showAlert('error', 'Некорректный ответ сервера')
        return
      }

      setConfirmState({ type: '', value: '' })

      const totalPagesAfter = Math.max(1, Math.ceil(serverTotal / pageSize))

      if (page > totalPagesAfter) {
        showAlert('success', 'Пост удален')
        await router.replace(`/posts?page=${totalPagesAfter}`)
        return
      }

      let nextPosts = posts.filter((p) => String(p.id) !== String(postIdToDelete))

      if (nextPosts.length === 0 && page > 1) {
        showAlert('success', 'Пост удален')
        await router.replace(`/posts?page=${page - 1}`)
        return
      }

      if (nextPosts.length < pageSize && (page - 1) * pageSize + nextPosts.length < serverTotal) {
        const offset = (page - 1) * pageSize + nextPosts.length
        const sliceRes = await fetch(`/api/posts/slice?offset=${offset}&limit=1`)
        const sliceData = await sliceRes.json().catch(() => null)
        if (sliceRes.ok && sliceData?.posts?.[0]) {
          nextPosts = [...nextPosts, sliceData.posts[0]]
        }
      }

      setPosts(nextPosts)
      setTotalPostsState(serverTotal)
      showAlert('success', 'Пост удален')
    } catch {
      showAlert('error', 'Ошибка при удалении поста')
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
        <TitleSummary>всего постов: {totalPostsState}</TitleSummary>

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
  pageSize: PropTypes.number.isRequired,
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
