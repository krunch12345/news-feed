import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Add, WarningAmber } from '@mui/icons-material'
import { Button, Stack, TextField, Typography } from '@mui/material'
import { DeleteConfirmModal } from '@/common/components/DeleteConfirmModal/components/DeleteConfirmModal'
import { buildDeleteDialogText } from '@/common/components/DeleteConfirmModal/utils/buildDeleteDialogText'
import { TitleSummary } from '@/common/components/TitleSummary/components/TitleSummary'
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
  const [confirmState, setConfirmState] = useState({ type: '', value: '' })
  
  const deleteDialogText = useMemo(() => buildDeleteDialogText(confirmState, [], []), [confirmState])

  const onDeleteConfirm = async () => {
    if (confirmState.value) {
      const formData = new FormData()
      formData.append('time', confirmState.value)

      await fetch('/api/schedule/delete', { method: 'POST', body: formData })

      window.location.reload()
    }
  }

  const closeConfirmDialog = () => {
    setConfirmState({ type: '', value: '' })
  }

  return (
    <MainLayout>
      <Stack spacing={2} maxWidth={520} alignSelf='center' width='100%'>
        <TitleSummary>всего таймингов: {totalSchedule}</TitleSummary>

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
