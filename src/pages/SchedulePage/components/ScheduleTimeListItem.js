import { Children } from 'react'
import PropTypes from 'prop-types'
import { DeleteForever } from '@mui/icons-material'
import { IconButton, List, ListItem, Stack, Typography } from '@mui/material'

/**
 * Renders schedule times list with delete actions.
 * @param {object} props Component props.
 * @param {string[]} props.scheduleTimes Schedule times to render.
 * @param {(payload: {type: string, value: string}) => void} props.onOpenDelete Opens delete confirmation dialog.
 * @returns {JSX.Element} Schedule list.
 */
export const ScheduleTimeList = ({ scheduleTimes, onOpenDelete }) => {
  const listItems = Children.toArray(
    scheduleTimes.map((timeValue) => (
      <ListItem>
        <Stack direction='row' justifyContent='space-between' alignItems='center' width='100%'>
          <Typography>{timeValue}</Typography>
          
          <IconButton edge='end' color='error' onClick={() => onOpenDelete({ type: 'schedule', value: timeValue })}>
            <DeleteForever />
          </IconButton>
        </Stack>
      </ListItem>
    )),
  )

  return <List>{listItems}</List>
}

ScheduleTimeList.propTypes = {
  scheduleTimes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onOpenDelete: PropTypes.func.isRequired,
}
