'use client'

import { Children, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  List,
  ListItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Add,
  ChevronLeft,
  ChevronRight,
  Close,
  ContentCopy,
  DeleteForever,
  KeyboardArrowUp,
  Search,
} from '@mui/icons-material'
import { AppHeader } from '@/components/AppHeader/components/AppHeader'

/**
 * Builds a copy-ready multiline post text.
 * @param {object} post Post view model.
 * @returns {string}
 */
const buildPostText = (post) => {
  const lines = []
  if (post.date_human) {
    lines.push(`🗓 ${post.date_human}`)
  }
  if (post.group) {
    lines.push(`📌 ${post.group}`)
  }
  if (post.text) {
    lines.push('', post.text)
  }
  if (post.attachments_view) {
    lines.push('', `Вложения: ${post.attachments_view}`)
  }
  if (post.url) {
    lines.push('', `🔗 ${post.url}`)
  }
  return lines.join('\n')
}

/**
 * Renders the main dashboard tabs and actions.
 * @param {object} props
 * @returns {JSX.Element}
 */
export const DashboardClient = ({
  activeTab,
  page,
  totalPages,
  totalPosts,
  totalSchedule,
  totalGroups,
  posts,
  scheduleTimes,
  groups,
  groupQuery,
}) => {
  const [confirmState, setConfirmState] = useState({ type: '', value: '' })
  const router = useRouter()
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [groupId, setGroupId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupError, setGroupError] = useState('')
  const [previewImages, setPreviewImages] = useState([])
  const [previewImageIndex, setPreviewImageIndex] = useState(0)
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false)

  const titleSummary = useMemo(() => {
    if (activeTab === 'posts') {
      return `всего постов: ${totalPosts}`
    }
    if (activeTab === 'schedule') {
      return `всего таймингов: ${totalSchedule}`
    }
    return `всего сообществ: ${totalGroups}`
  }, [activeTab, totalGroups, totalPosts, totalSchedule])

  const onCopyClick = async (post) => {
    try {
      await navigator.clipboard.writeText(buildPostText(post))
    } catch {
      window.alert('Не удалось скопировать текст')
    }
  }

  const onDeleteConfirm = async () => {
    const { type, value } = confirmState
    if (!type || !value) {
      return
    }

    if (type === 'post') {
      await fetch(`/api/delete/${encodeURIComponent(value)}`, { method: 'POST' })
    } else if (type === 'schedule') {
      const formData = new FormData()
      formData.append('time', value)
      await fetch('/api/schedule/delete', { method: 'POST', body: formData })
    } else if (type === 'group') {
      const formData = new FormData()
      formData.append('group_id', value)
      await fetch('/api/groups/delete', { method: 'POST', body: formData })
    }

    window.location.reload()
  }

  const onGroupAdd = async () => {
    const digitsOnly = groupId.replace(/\D/g, '')
    if (!digitsOnly) {
      setGroupError('ID сообщества не может быть пустым')
      return
    }

    const formData = new FormData()
    formData.append('group_id', `-${digitsOnly}`)
    formData.append('group_name', groupName.trim())

    const response = await fetch('/api/groups/add', { method: 'POST', body: formData })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      setGroupError(data?.message || 'Ошибка при добавлении сообщества')
      return
    }

    setIsGroupDialogOpen(false)
    window.location.href = '/?tab=groups'
  }

  const closePreview = () => {
    setPreviewImages([])
    setPreviewImageIndex(0)
  }

  const previewImageUrl = previewImages[previewImageIndex] || ''

  const openPreview = (images, index) => {
    setPreviewImages(images)
    setPreviewImageIndex(index)
  }

  useEffect(() => {
    const updateScrollTopVisibility = () => {
      const scrollTop = window.scrollY
      const threshold = window.innerHeight
      setIsScrollTopVisible(scrollTop > threshold)
    }

    updateScrollTopVisibility()
    window.addEventListener('resize', updateScrollTopVisibility, { passive: true })
    window.addEventListener('scroll', updateScrollTopVisibility, { passive: true })

    return () => {
      window.removeEventListener('resize', updateScrollTopVisibility)
      window.removeEventListener('scroll', updateScrollTopVisibility)
    }
  }, [activeTab, posts.length, scheduleTimes.length, groups.length])

  const deleteDialogText = useMemo(() => {
    if (!confirmState.type || !confirmState.value) {
      return ''
    }

    if (confirmState.type === 'post') {
      const post = posts.find((item) => item.id === confirmState.value)
      const groupName = post?.group || 'сообщество'
      const timing = post?.date_human
      return timing ? `${groupName} (${timing})` : groupName
    }

    if (confirmState.type === 'schedule') {
      return String(confirmState.value)
    }

    if (confirmState.type === 'group') {
      const group = groups.find((item) => item.id === confirmState.value)
      const groupName = group?.name || confirmState.value
      return groupName
    }

    return ''
  }, [confirmState.type, confirmState.value, posts, scheduleTimes, groups])

  useEffect(() => {
    if (!previewImageUrl) {
      return undefined
    }

    const onPreviewKeyDown = (event) => {
      if (previewImages.length > 1 && event.key === 'ArrowLeft') {
        setPreviewImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length)
      } else if (previewImages.length > 1 && event.key === 'ArrowRight') {
        setPreviewImageIndex((prev) => (prev + 1) % previewImages.length)
      }
    }

    window.addEventListener('keydown', onPreviewKeyDown)
    return () => {
      window.removeEventListener('keydown', onPreviewKeyDown)
    }
  }, [previewImageUrl, previewImages])

  const postCards = Children.toArray(
    posts.map((post) => {
      const postImages = Children.toArray(
        (post.postImages || []).map((imageName, imageIndex) => (
          <Box
            key={imageName}
            component='img'
            src={`/api/images/${imageName}`}
            alt='Изображение поста'
            onClick={() =>
              openPreview(
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
        <Card
          key={post.id}
          sx={{
            position: 'relative',
            borderRadius: '24px',
            padding: '5px',
            overflow: 'visible',
            backgroundColor: 'transparent',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              padding: '4px',
              background: 'linear-gradient(270deg, #6cff00, #00b894, #2dff7f, #1de9b6)',
              backgroundSize: '320% 320%',
              animation: 'postNeonGlow 8s ease-in-out infinite',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              opacity: 0.66,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 9px rgba(77, 255, 121, 0.46))',
            },
            '&:hover::before': {
              opacity: 1,
              animation: 'postNeonGlow 10s ease-in-out infinite',
            },
            '@keyframes postNeonGlow': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' },
            },
          }}
        >
          <CardContent
            sx={{
              position: 'relative',
              zIndex: 1,
              borderRadius: '20px',
              overflow: 'visible',
              backgroundImage: 'linear-gradient(135deg, rgba(5, 14, 11, 0.94) 0%, rgba(8, 26, 19, 0.88) 50%, rgba(13, 34, 26, 0.8) 100%)',
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Typography variant='h6' fontWeight={700}>{post.group}</Typography>
                <Typography variant='body2'>{post.date_human}</Typography>
              </Stack>
              <Typography whiteSpace='pre-line'>{post.text || 'Без текста'}</Typography>
              {postImages.length ? <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' justifyContent='center'>{postImages}</Stack> : null}
              {post.attachments_view ? <Typography variant='body2' color='text.secondary'>Вложения: {post.attachments_view}</Typography> : null}
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
                    onClick={() => setConfirmState({ type: 'post', value: post.id })}
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
            </Stack>
          </CardContent>
        </Card>
      )
    }),
  )

  const scheduleListItems = Children.toArray(
    scheduleTimes.map((timeValue) => (
      <ListItem key={timeValue}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' width='100%'>
          <Typography>{timeValue}</Typography>
          <IconButton edge='end' color='error' onClick={() => setConfirmState({ type: 'schedule', value: timeValue })}>
            <DeleteForever />
          </IconButton>
        </Stack>
      </ListItem>
    )),
  )

  const groupListItems = Children.toArray(
    groups.map((group) => (
      <ListItem key={group.id}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' width='100%'>
          <Stack direction='row' spacing={1}>
            <Typography>{group.name}</Typography>
            <Typography color='text.secondary'>ID: {String(group.id).replace(/-/g, '')}</Typography>
          </Stack>
          <IconButton edge='end' color='error' onClick={() => setConfirmState({ type: 'group', value: group.id })}>
            <DeleteForever />
          </IconButton>
        </Stack>
      </ListItem>
    )),
  )

  return (
    <Stack spacing={0}>
      <AppHeader activeTab={activeTab} />

      <Stack spacing={2} maxWidth={1080} margin='0 auto' paddingX={2} paddingTop={2} paddingBottom={2} width='100%' alignSelf='center'>
        <Typography variant='body2' textAlign='center' color='text.secondary'>
          {titleSummary}
        </Typography>

        {activeTab === 'posts' && totalPages > 1 ? (
          <Stack direction='row' justifyContent='center'>
            <Pagination
              page={page}
              count={totalPages}
              sx={{
                '& .MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: 'success.dark',
                  color: '#ffffff',
                },
                '& .MuiPaginationItem-root.Mui-selected:hover': {
                  backgroundColor: 'success.dark',
                  filter: 'brightness(0.92)',
                },
              }}
              onChange={(_event, value) => {
                router.push(`/?tab=posts&page=${value}`)
              }}
            />
          </Stack>
        ) : null}

        {activeTab === 'posts' ? (
          posts.length ? (
            <Stack spacing={2}>
              {postCards}
              {totalPages > 1 ? (
                <Stack direction='row' justifyContent='center'>
                  <Pagination
                    page={page}
                    count={totalPages}
                    sx={{
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: 'success.dark',
                        color: '#ffffff',
                      },
                      '& .MuiPaginationItem-root.Mui-selected:hover': {
                        backgroundColor: 'success.dark',
                        filter: 'brightness(0.92)',
                      },
                    }}
                    onChange={(_event, value) => {
                      router.push(`/?tab=posts&page=${value}`)
                    }}
                  />
                </Stack>
              ) : null}
            </Stack>
          ) : (
            <Typography color='text.secondary' textAlign='center'>
              Постов нет
            </Typography>
          )
        ) : null}

        {activeTab === 'schedule' ? (
          <Stack spacing={2} maxWidth={520} alignSelf='center' width='100%'>
            <form action='/api/schedule/add' method='post'>
              <Stack direction='row' spacing={1}>
                <TextField type='time' name='time' required fullWidth size='small' />
                <Button
                  type='submit'
                  variant='contained'
                  color='success'
                  startIcon={<Add />}
                  sx={{
                    px: 3.25,
                    '& .MuiButton-startIcon': {
                      marginRight: 1,
                    },
                  }}
                >
                  Добавить
                </Button>
              </Stack>
            </form>
            {scheduleTimes.length ? (
              <List>{scheduleListItems}</List>
            ) : (
              <Typography color='text.secondary' textAlign='center'>
                Таймингов нет
              </Typography>
            )}
          </Stack>
        ) : null}

        {activeTab === 'groups' ? (
          <Stack spacing={2} maxWidth={720} alignSelf='center' width='100%'>
            <form action='/' method='get'>
              <input type='hidden' name='tab' value='groups' />
              <Stack direction='row' spacing={1}>
                <TextField name='group_query' defaultValue={groupQuery} placeholder='Поиск по названию или ID' size='small' fullWidth />
                <IconButton type='submit' color='success' aria-label='Искать' sx={{ backgroundColor: 'transparent' }}>
                  <Search />
                </IconButton>
                <Button
                  type='button'
                  variant='contained'
                  color='success'
                  onClick={() => setIsGroupDialogOpen(true)}
                  startIcon={<Add />}
                  sx={{
                    px: 3.25,
                    '& .MuiButton-startIcon': {
                      marginRight: 1,
                    },
                  }}
                >
                  Добавить
                </Button>
              </Stack>
            </form>
            {groups.length ? (
              <List>{groupListItems}</List>
            ) : (
              <Typography color='text.secondary' textAlign='center'>
                Сообществ нет
              </Typography>
            )}
          </Stack>
        ) : null}
      </Stack>

      <Dialog
        open={Boolean(confirmState.type)}
        onClose={() => setConfirmState({ type: '', value: '' })}
        maxWidth='sm'
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
            },
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(8, 12, 8, 0.96)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6'>Подтверждение удаления</Typography>
            <IconButton
              color='error'
              onClick={() => setConfirmState({ type: '', value: '' })}
              aria-label='Закрыть'
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {deleteDialogText ? <Typography variant='h6' color='text.secondary'>{deleteDialogText}</Typography> : null}
        </DialogContent>
        <DialogActions>
          <Button color='success' onClick={() => setConfirmState({ type: '', value: '' })}>
            Отмена
          </Button>
          <Button color='error' variant='contained' onClick={onDeleteConfirm}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isGroupDialogOpen} onClose={() => setIsGroupDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Добавить сообщество</DialogTitle>
        <DialogContent>
          <Stack spacing={2} paddingTop={1}>
            <TextField
              label='ID сообщества'
              value={groupId}
              onChange={(event) => setGroupId(event.target.value.replace(/\D/g, ''))}
              fullWidth
            />
            <TextField label='Название (необязательно)' value={groupName} onChange={(event) => setGroupName(event.target.value)} fullWidth />
            {groupError ? <Alert severity='error'>{groupError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color='inherit' onClick={() => setIsGroupDialogOpen(false)}>
            Отмена
          </Button>
          <Button variant='contained' onClick={onGroupAdd}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(previewImageUrl)}
        onClose={closePreview}
        maxWidth='lg'
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
            },
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(8, 12, 8, 0.96)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6'>Изображения</Typography>
            <IconButton color='error' onClick={closePreview}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ overflow: 'hidden', pb: 2 }}>
          {previewImageUrl ? (
            <Stack direction='row' spacing={1} alignItems='center' justifyContent='center' sx={{ minHeight: '70vh', overflow: 'hidden' }}>
              {previewImages.length > 1 ? (
                <IconButton
                  color='success'
                  onClick={() => setPreviewImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length)}
                >
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
                <IconButton
                  color='success'
                  onClick={() => setPreviewImageIndex((prev) => (prev + 1) % previewImages.length)}
                >
                  <ChevronRight />
                </IconButton>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {isScrollTopVisible ? (
        <Fab
          color='success'
          size='small'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 1300,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      ) : null}
    </Stack>
  )
}

DashboardClient.propTypes = {
  activeTab: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalPosts: PropTypes.number.isRequired,
  totalSchedule: PropTypes.number.isRequired,
  totalGroups: PropTypes.number.isRequired,
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
  scheduleTimes: PropTypes.arrayOf(PropTypes.string).isRequired,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  groupQuery: PropTypes.string.isRequired,
}
