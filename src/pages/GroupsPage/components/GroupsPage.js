import { Children, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Add, DeleteForever, Search } from '@mui/icons-material'
import { Button, IconButton, List, ListItem, Stack, TextField, Typography } from '@mui/material'
import { DeleteConfirmModal } from '@/common/components/DeleteConfirmModal/components/DeleteConfirmModal'
import { buildDeleteDialogText } from '@/common/components/DeleteConfirmModal/utils/buildDeleteDialogText'
import { TitleSummary } from '@/common/components/TitleSummary/components/TitleSummary'
import { MainLayout } from '@/layouts/MainLayout/components/MainLayout'
import { AddGroupModal } from '@/pages/GroupsPage/components/AddGroupModal'

/**
 * Renders the main groups page component.
 * @param {object} props Component props.
 * @param {object[]} props.groups List of group view models.
 * @param {string} props.groupQuery Current group search query.
 * @param {number} props.totalGroups Total number of groups.
 * @returns {JSX.Element} Groups page component.
 */
export const GroupsPage = ({ groups, groupQuery, totalGroups }) => {
  const [confirmState, setConfirmState] = useState({ type: '', value: '' })
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [groupId, setGroupId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupError, setGroupError] = useState('')

  const deleteDialogText = useMemo(() => buildDeleteDialogText(confirmState, [], groups), [confirmState, groups])

  const onDeleteConfirm = async () => {
    if (!confirmState.value) {
      return
    }

    const formData = new FormData()
    formData.append('group_id', confirmState.value)

    await fetch('/api/groups/delete', { method: 'POST', body: formData })

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
    window.location.href = '/groups'
  }

  const onGroupIdChange = (event) => {
    setGroupId(event.target.value.replace(/\D/g, ''))
    groupError && setGroupError('')
  }

  const onGroupNameChange = (event) => {
    setGroupName(event.target.value)
  }

  const closeConfirmDialog = () => {
    setConfirmState({ type: '', value: '' })
  }

  const closeAddGroupDialog = () => {
    setIsGroupDialogOpen(false)
    setGroupError('')
  }

  const groupListItems = Children.toArray(
    groups.map((group) => (
      <ListItem>
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
    <MainLayout>
      <Stack spacing={2} maxWidth={720} alignSelf='center' width='100%'>
        <TitleSummary>всего сообществ: {totalGroups}</TitleSummary>

        <form action='/groups' method='get'>
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

      <DeleteConfirmModal
        open={Boolean(confirmState.type)}
        deleteDialogText={deleteDialogText}
        onClose={closeConfirmDialog}
        onConfirm={onDeleteConfirm}
      />
      
      <AddGroupModal
        open={isGroupDialogOpen}
        groupId={groupId}
        groupName={groupName}
        groupError={groupError}
        onClose={closeAddGroupDialog}
        onGroupIdChange={onGroupIdChange}
        onGroupNameChange={onGroupNameChange}
        onConfirm={onGroupAdd}
      />
    </MainLayout>
  )
}

GroupsPage.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  groupQuery: PropTypes.string.isRequired,
  totalGroups: PropTypes.number.isRequired,
}
