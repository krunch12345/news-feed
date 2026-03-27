import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import { Pagination, Stack } from '@mui/material'

/**
 * Renders reusable styled pagination for page-based navigation.
 * @param {object} props Component props.
 * @param {number} props.page Current page number.
 * @param {number} props.totalPages Total number of pages.
 * @param {string} props.basePath Base path for navigation.
 * @returns {JSX.Element|null} Pagination component or null if totalPages <= 1.
 */
export const StyledPagination = ({ page, totalPages, basePath }) => {
  const router = useRouter()

  if (totalPages <= 1) {
    return null
  }

  return (
    <Stack direction='row' justifyContent='center'>
      <Pagination
        page={page}
        count={totalPages}
        onChange={(_event, value) => {
          router.push(`${basePath}?page=${value}`)
        }}
        sx={{
          '& .MuiPaginationItem-page:not(.Mui-selected)': {
            color: 'success.light',
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: 'success.dark',
            color: '#ffffff',
          },
          '& .MuiPaginationItem-root.Mui-selected:hover': {
            backgroundColor: 'success.dark',
            filter: 'brightness(0.92)',
          },
          '& .MuiPaginationItem-previousNext, & .MuiPaginationItem-firstLast': {
            color: 'success.main',
          },
        }}
      />
    </Stack>
  )
}

StyledPagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  basePath: PropTypes.string,
}

StyledPagination.defaultProps = {
  basePath: '/posts',
}
