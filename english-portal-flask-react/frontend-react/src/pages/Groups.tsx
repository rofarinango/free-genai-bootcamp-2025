import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { groups } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from '@mui/material';

export function Groups() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['groups', page],
    queryFn: () => groups.getAll({}, page),
  });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowClick = (groupId: number) => {
    navigate(`/groups/${groupId}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="text.secondary">{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{t('common.error')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('groups.title')}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="center">Word Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.items.length ? (
              data.items.map((group) => (
                <TableRow
                  key={group.id}
                  hover
                  onClick={() => handleRowClick(group.id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {group.name}
                  </TableCell>
                  <TableCell align="center">
                    {group.word_count}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography color="text.secondary">{t('groups.noGroups')}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {data && data.pagination.total_pages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={data.pagination.total_pages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
} 