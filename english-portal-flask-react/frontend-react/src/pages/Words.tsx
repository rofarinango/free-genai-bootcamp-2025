import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { words } from '../lib/api';
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

export function Words() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['words', page],
    queryFn: () => words.getAll({}, page),
  });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowClick = (wordId: number) => {
    navigate(`/words/${wordId}`);
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
        {t('words.title')}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('words.english')}</TableCell>
              <TableCell>{t('words.spanish')}</TableCell>
              <TableCell align="center">{t('words.correct')}</TableCell>
              <TableCell align="center">{t('words.wrong')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.items.length ? (
              data.items.map((word) => (
                <TableRow
                  key={word.id}
                  hover
                  onClick={() => handleRowClick(word.id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {word.english}
                  </TableCell>
                  <TableCell>{word.spanish}</TableCell>
                  <TableCell align="center" sx={{ color: 'success.main' }}>
                    {word.correct_count}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'error.main' }}>
                    {word.wrong_count}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">{t('words.noWords')}</Typography>
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