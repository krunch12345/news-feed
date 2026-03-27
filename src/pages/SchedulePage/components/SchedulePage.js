import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Add, WarningAmber } from '@mui/icons-material'
import { Button, Stack, TextField, Typography } from '@mui/material'
import { DeleteConfirmModal } from '@/common/components/DeleteConfirmModal/components/DeleteConfirmModal'
import { buildDeleteDialogText } from '@/common/components/DeleteConfirmModal/utils/buildDeleteDialogText'
import { TitleSummary } from '@/common/components/TitleSummary/components/TitleSummary'
import { RELOAD_DELAY_MS } from '@/common/constants/loadingTimings'
import { useAppAlert } from '@/common/hooks/useAppAlert'
import { MainLayout } from '@/layouts/MainLayout/components/MainLayout'
import { ScheduleTimeList } from '@/pages/SchedulePage/components/ScheduleTimeListItem'

/**
 * Renders schedule page with add form, list, and delete confirmation.
 * @param {object} props Component props.
 * @param {number} props.totalSchedule Total count of schedule entries.
 * @param {string[]} props.scheduleTimes List of schedule times.
 * @returns {JSX.Element} Schedule page content.
 */
export const SchedulePage = ({ totalSchedule, scheduleTimes }) => {
  const { showAlert } = useAppAlert()
  const [confirmState, setConfirmState] = useState({ type: '', value: '' })
  const [newTime, setNewTime] = useState('')
  
  const deleteDialogText = useMemo(() => buildDeleteDialogText(confirmState, [], []), [confirmState])

  const onDeleteConfirm = async () => {
    if (confirmState.value) {
      try {
        const response = await fetch('/api/schedule/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ time: confirmState.value }),
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          showAlert('error', data?.message || 'Ошибка при удалении тайминга')
          return
        }

        showAlert('success', 'Тайминг удален', { persistOnReload: true })
        window.setTimeout(() => {
          window.location.reload()
        }, RELOAD_DELAY_MS)
      } catch {
        showAlert('error', 'Ошибка при удалении тайминга')
      }
    }
  }

  const onAddScheduleSubmit = async (event) => {
    event.preventDefault()

    try {
      const trimmedTime = newTime.trim()
      const response = await fetch('/api/schedule/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: trimmedTime }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        showAlert('error', data?.message || 'Ошибка при добавлении тайминга')
        return
      }

      showAlert('success', 'Тайминг добавлен', { persistOnReload: true })
      window.setTimeout(() => {
        window.location.reload()
      }, RELOAD_DELAY_MS)
    } catch {
      showAlert('error', 'Ошибка при добавлении тайминга')
    }
  }

  const closeConfirmDialog = () => {
    setConfirmState({ type: '', value: '' })
  }

  return (
    <MainLayout>
      <Stack spacing={2} maxWidth={520} alignSelf='center' width='100%'>
        <TitleSummary>всего таймингов: {totalSchedule}</TitleSummary>

        <form onSubmit={onAddScheduleSubmit}>
          <Stack direction='row' spacing={1}>
            <TextField
              type='time'
              name='time'
              required
              fullWidth
              size='small'
              value={newTime}
              onChange={(event) => setNewTime(event.target.value)}
            />

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
          <ScheduleTimeList scheduleTimes={scheduleTimes} onOpenDelete={setConfirmState} />
        ) : (
          <Stack spacing={1} alignItems='center'>
            <WarningAmber color='warning' />

            <Typography color='text.secondary' textAlign='center'>
              Тайминги обновления поста не установлены
            </Typography>
          </Stack>
        )}
      </Stack>

      <DeleteConfirmModal
        open={Boolean(confirmState.type)}
        deleteDialogText={deleteDialogText}
        onClose={closeConfirmDialog}
        onConfirm={onDeleteConfirm}
      />
    </MainLayout>
  )
}

SchedulePage.propTypes = {
  totalSchedule: PropTypes.number.isRequired,
  scheduleTimes: PropTypes.arrayOf(PropTypes.string).isRequired,
}
